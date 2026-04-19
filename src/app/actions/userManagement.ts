"use server";

import { revalidatePath } from "next/cache";
import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import { createAdminClient } from "@/lib/supabase/server";
import type { ProjectId } from "@/lib/supabase/projects";

const ALL_PROJECTS: ProjectId[] = ["2026", "2025"];

export async function createUserInAllProjects(name: string, email: string, password: string) {
  const errors: string[] = [];

  for (const projectId of ALL_PROJECTS) {
    const adminClient = createAdminClientForProject(projectId);
    const { error } = await adminClient.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      user_metadata: { name: name.trim() },
      email_confirm: true,
    });
    if (error && !error.message.toLowerCase().includes("already registered") && !error.message.toLowerCase().includes("already been registered")) {
      errors.push(`${projectId}: ${error.message}`);
    }
  }

  // Add to project_admins (both projects use same table or fallback)
  const supabase = await createAdminClient();
  await supabase.from("project_admins").upsert({ email: email.toLowerCase().trim() }, { onConflict: "email" });

  if (errors.length > 0) throw new Error(errors.join("; "));
  revalidatePath("/admin/settings");
}

export async function updateUserInAllProjects(userId2026: string | null, userId2025: string | null, name: string, email: string, password?: string) {
  const updates: Record<string, any> = {
    email: email.toLowerCase().trim(),
    user_metadata: { name: name.trim() },
  };
  if (password) updates.password = password;

  const pairs: [ProjectId, string | null][] = [["2026", userId2026], ["2025", userId2025]];
  for (const [projectId, userId] of pairs) {
    if (!userId) continue;
    const adminClient = createAdminClientForProject(projectId);
    await adminClient.auth.admin.updateUserById(userId, updates);
  }
  revalidatePath("/admin/settings");
}

export async function deleteUserFromAllProjects(email: string) {
  for (const projectId of ALL_PROJECTS) {
    const adminClient = createAdminClientForProject(projectId);
    const { data } = await adminClient.auth.admin.listUsers();
    const user = data?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (user) await adminClient.auth.admin.deleteUser(user.id);
  }

  const supabase = await createAdminClient();
  await supabase.from("project_admins").delete().eq("email", email.toLowerCase());
  revalidatePath("/admin/settings");
}

export async function listUsersWithMeta(): Promise<{ email: string; name: string | null; id2026: string | null; id2025: string | null }[]> {
  const supabase = await createAdminClient();
  const { data: adminsData } = await supabase.from("project_admins").select("email").order("email");
  const adminEmails = adminsData?.map((a) => a.email) ?? [];

  if (adminEmails.length === 0) return [];

  const admin2026 = createAdminClientForProject("2026");
  const admin2025 = createAdminClientForProject("2025");

  const [res2026, res2025] = await Promise.all([
    admin2026.auth.admin.listUsers({ perPage: 500 }),
    admin2025.auth.admin.listUsers({ perPage: 500 }),
  ]);

  const users2026 = res2026.data?.users ?? [];
  const users2025 = res2025.data?.users ?? [];

  return adminEmails.map((email) => {
    const u2026 = users2026.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    const u2025 = users2025.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    const name = u2026?.user_metadata?.name ?? u2025?.user_metadata?.name ?? null;
    return { email, name, id2026: u2026?.id ?? null, id2025: u2025?.id ?? null };
  });
}
