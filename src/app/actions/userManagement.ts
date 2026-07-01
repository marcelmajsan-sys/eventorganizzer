"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import { PROJECT_COOKIE, resolveProjectId } from "@/lib/supabase/projects";
import type { ProjectId } from "@/lib/supabase/projects";

const ALL_PROJECTS: ProjectId[] = ["2026", "2025"];

const FALLBACK_ADMIN_EMAILS = ["marcel@ecommerce.hr", "udruga@ecommerce.hr", "laura@ecommerce.hr"];

type ActionResult = { error: string | null };

export async function createUserInAllProjects(
  name: string,
  email: string,
  password: string,
  phone?: string
): Promise<ActionResult> {
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedName = name.trim();
  const normalizedPhone = phone?.trim() ?? "";
  const errors: string[] = [];

  for (const projectId of ALL_PROJECTS) {
    const adminClient = createAdminClientForProject(projectId);
    const { error } = await adminClient.auth.admin.createUser({
      email: normalizedEmail,
      password,
      user_metadata: { name: normalizedName, phone: normalizedPhone },
      email_confirm: true,
    });
    if (
      error &&
      !error.message.toLowerCase().includes("already registered") &&
      !error.message.toLowerCase().includes("already been registered")
    ) {
      errors.push(`${projectId} (auth): ${error.message}`);
    }
  }

  for (const projectId of ALL_PROJECTS) {
    const adminClient = createAdminClientForProject(projectId);
    const { error } = await adminClient
      .from("project_admins")
      .upsert({ email: normalizedEmail }, { onConflict: "email" });
    if (error) {
      errors.push(`${projectId} (project_admins): ${error.message}`);
    }
  }

  revalidatePath("/admin/settings");

  if (errors.length > 0) {
    return { error: errors.join("; ") };
  }
  return { error: null };
}

export async function updateUserInAllProjects(
  userId2026: string | null,
  userId2025: string | null,
  name: string,
  email: string,
  phone?: string,
  password?: string
): Promise<ActionResult> {
  const updates: Record<string, any> = {
    email: email.toLowerCase().trim(),
    user_metadata: { name: name.trim(), phone: phone?.trim() ?? "" },
  };
  if (password) updates.password = password;

  const errors: string[] = [];
  const pairs: [ProjectId, string | null][] = [["2026", userId2026], ["2025", userId2025]];
  for (const [projectId, userId] of pairs) {
    if (!userId) continue;
    const adminClient = createAdminClientForProject(projectId);
    const { error } = await adminClient.auth.admin.updateUserById(userId, updates);
    if (error) {
      errors.push(`${projectId}: ${error.message}`);
    }
  }
  revalidatePath("/admin/settings");
  return { error: errors.length > 0 ? errors.join("; ") : null };
}

export async function deleteUserFromAllProjects(email: string): Promise<ActionResult> {
  const normalizedEmail = email.toLowerCase();
  const errors: string[] = [];

  for (const projectId of ALL_PROJECTS) {
    const adminClient = createAdminClientForProject(projectId);
    const { data, error: listError } = await adminClient.auth.admin.listUsers();
    if (listError) {
      errors.push(`${projectId} (list): ${listError.message}`);
      continue;
    }
    const user = data?.users?.find((u) => u.email?.toLowerCase() === normalizedEmail);
    if (user) {
      const { error: delError } = await adminClient.auth.admin.deleteUser(user.id);
      if (delError) errors.push(`${projectId} (auth delete): ${delError.message}`);
    }
  }

  for (const projectId of ALL_PROJECTS) {
    const adminClient = createAdminClientForProject(projectId);
    const { error } = await adminClient.from("project_admins").delete().eq("email", normalizedEmail);
    if (error) errors.push(`${projectId} (project_admins): ${error.message}`);
  }
  revalidatePath("/admin/settings");
  return { error: errors.length > 0 ? errors.join("; ") : null };
}

export async function listUsersWithMeta(): Promise<{ email: string; name: string | null; phone: string | null; id2026: string | null; id2025: string | null }[]> {
  const cookieStore = await cookies();
  const activeProject = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);

  let adminEmails: string[] = [];
  try {
    // Use direct service-role client (bypasses RLS reliably) — createServerClient
    // with service key still tracks the authenticated user session and gets
    // downgraded to `authenticated` role, which RLS on project_admins blocks.
    const supabase = createAdminClientForProject(activeProject);
    const { data: adminsData, error } = await supabase.from("project_admins").select("email").order("email");
    if (error) console.error("[listUsersWithMeta] project_admins select error:", error.message);
    adminEmails = adminsData?.map((a) => a.email) ?? [];
  } catch (e) {
    console.error("[listUsersWithMeta] unexpected error:", e);
  }

  if (adminEmails.length === 0) adminEmails = FALLBACK_ADMIN_EMAILS;

  let users2026: any[] = [];
  let users2025: any[] = [];
  try {
    const admin2026 = createAdminClientForProject("2026");
    const admin2025 = createAdminClientForProject("2025");
    const [res2026, res2025] = await Promise.all([
      admin2026.auth.admin.listUsers({ perPage: 500 }),
      admin2025.auth.admin.listUsers({ perPage: 500 }),
    ]);
    users2026 = res2026.data?.users ?? [];
    users2025 = res2025.data?.users ?? [];
  } catch {}

  return adminEmails.map((email) => {
    const u2026 = users2026.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
    const u2025 = users2025.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
    const name = (u2026?.user_metadata?.name ?? u2025?.user_metadata?.name) as string | null ?? null;
    const phone = (u2026?.user_metadata?.phone ?? u2025?.user_metadata?.phone) as string | null ?? null;
    return {
      email,
      name,
      phone: phone || null,
      id2026: (u2026?.id as string | null) ?? null,
      id2025: (u2025?.id as string | null) ?? null,
    };
  });
}
