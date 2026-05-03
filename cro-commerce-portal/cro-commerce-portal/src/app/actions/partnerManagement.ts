"use server";

import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import { createAdminClient } from "@/lib/supabase/server";
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
  projectId: "2026" | "2025";
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

  // Kreiraj/pronađi korisnika u aktivnom projektu
  let userId: string | null = null;
  const { data: existing } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
  const existingUser = existing?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (existingUser) {
    userId = existingUser.id;
    // Ažuriraj lozinku i ime — admin je možda unio novu lozinku
    await adminClient.auth.admin.updateUserById(userId, {
      password,
      user_metadata: { name: name.trim() },
      email_confirm: true,
    });
  } else {
    const { data, error } = await adminClient.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      user_metadata: { name: name.trim() },
      email_confirm: true,
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("Greška pri kreiranju korisnika");
    userId = data.user.id;
  }

  // Upsert sponsor_users samo u aktivnom projektu
  const { error: suError } = await adminClient
    .from("sponsor_users")
    .upsert({ user_id: userId, sponsor_id: sponsorId, invited_by: "admin" }, { onConflict: "user_id" });

  if (suError) throw new Error(`sponsor_users: ${suError.message}`);
}

export async function changePartnerPassword(userId: string, newPassword: string, projectId: "2026" | "2025") {
  const adminClient = createAdminClientForProject(projectId);
  const { error } = await adminClient.auth.admin.updateUserById(userId, { password: newPassword });
  if (error) throw new Error(error.message);
}

export async function deletePartnerUser(sponsorUsersId: string, userId: string, projectId: "2026" | "2025") {
  const adminClient = createAdminClientForProject(projectId);
  await adminClient.from("sponsor_users").delete().eq("id", sponsorUsersId);
  await adminClient.auth.admin.deleteUser(userId);
}

export async function listSponsorsForSelect(): Promise<{ id: string; name: string }[]> {
  const supabase = await createAdminClient();
  const { data } = await supabase.from("sponsors").select("id, name").order("name");
  return data ?? [];
}

export async function updatePrimaryContact(
  sponsorId: string,
  data: { contact_name: string | null; contact_email: string | null; contact_phone: string | null }
): Promise<{ error: string | null }> {
  try {
    const cookieStore = await cookies();
    const projectId = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);
    const adminClient = createAdminClientForProject(projectId);
    const { error } = await adminClient
      .from("sponsors")
      .update({
        contact_name: data.contact_name || null,
        contact_email: data.contact_email || null,
        contact_phone: data.contact_phone || null,
      })
      .eq("id", sponsorId);
    return { error: error ? error.message : null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Nepoznata greška" };
  }
}
