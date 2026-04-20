"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import { cookies } from "next/headers";
import { PROJECT_COOKIE, resolveProjectId } from "@/lib/supabase/projects";
import type { ProjectId } from "@/lib/supabase/projects";

export interface PartnerUser {
  id: string; // sponsor_users.id
  user_id: string;
  sponsor_id: string;
  sponsor_name: string;
  email: string;
  name: string | null;
}

export async function listPartnerUsers(): Promise<PartnerUser[]> {
  const supabase = await createAdminClient();

  const { data: sponsorUsers } = await supabase
    .from("sponsor_users")
    .select("id, user_id, sponsor_id, sponsors(name)")
    .order("created_at");

  if (!sponsorUsers || sponsorUsers.length === 0) return [];

  const cookieStore = await cookies();
  const projectId = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);
  const adminClient = createAdminClientForProject(projectId);
  const { data: authData } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
  const authUsers = authData?.users ?? [];

  return sponsorUsers.map((su) => {
    const authUser = authUsers.find((u) => u.id === su.user_id);
    const sponsorsRaw = su.sponsors as unknown;
    const sponsor = (Array.isArray(sponsorsRaw) ? sponsorsRaw[0] : sponsorsRaw) as { name: string } | null;
    return {
      id: su.id,
      user_id: su.user_id,
      sponsor_id: su.sponsor_id,
      sponsor_name: sponsor?.name ?? "—",
      email: authUser?.email ?? su.user_id,
      name: authUser?.user_metadata?.name ?? null,
    };
  });
}

export async function createPartnerUser(
  email: string,
  password: string,
  sponsorId: string,
  name: string
) {
  const cookieStore = await cookies();
  const projectId = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);
  const adminClient = createAdminClientForProject(projectId);

  // Kreiraj korisnika u auth (samo aktivni projekt)
  let userId: string | null = null;
  const { data: existing } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
  const existingUser = existing?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (existingUser) {
    userId = existingUser.id;
  } else {
    const { data, error } = await adminClient.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      user_metadata: { name: name.trim() },
      email_confirm: true,
    });
    if (error) throw new Error(error.message);
    userId = data.user.id;
  }

  // Upsert u sponsor_users
  const supabase = await createAdminClient();
  const { error: suError } = await supabase
    .from("sponsor_users")
    .upsert({ user_id: userId, sponsor_id: sponsorId, invited_by: "admin" }, { onConflict: "user_id" });

  if (suError) throw new Error(suError.message);
  revalidatePath("/admin/settings");
}

export async function deletePartnerUser(sponsorUsersId: string, userId: string) {
  const supabase = await createAdminClient();
  await supabase.from("sponsor_users").delete().eq("id", sponsorUsersId);

  // Obriši auth korisnika samo u aktivnom projektu
  const cookieStore = await cookies();
  const projectId = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);
  const adminClient = createAdminClientForProject(projectId);
  await adminClient.auth.admin.deleteUser(userId);

  revalidatePath("/admin/settings");
}

export async function listSponsorsForSelect(): Promise<{ id: string; name: string }[]> {
  const supabase = await createAdminClient();
  const { data } = await supabase.from("sponsors").select("id, name").order("name");
  return data ?? [];
}
