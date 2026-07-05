"use server";

import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import type { ProjectId } from "@/lib/supabase/projects";
import { sendWelcomeEmail } from "@/lib/email";
import { requireAdmin, requireAdminOrSponsor } from "@/lib/authGuards";

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
): Promise<{ emailSent?: boolean; partner?: PartnerUser; error?: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  const projectId = auth.projectId;
  const adminClient = createAdminClientForProject(projectId);

  // Kreiraj/pronađi korisnika u aktivnom projektu
  let userId: string | null = null;
  const { data: existing } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
  const existingUser = existing?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (existingUser) {
    userId = existingUser.id;
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
    if (error) return { error: error.message };
    if (!data.user) return { error: "Greška pri kreiranju korisnika" };
    userId = data.user.id;
  }

  // Upsert sponsor_users samo u aktivnom projektu
  const { data: suRow, error: suError } = await adminClient
    .from("sponsor_users")
    .upsert({ user_id: userId, sponsor_id: sponsorId, invited_by: "admin" }, { onConflict: "user_id" })
    .select("id")
    .single();

  if (suError) return { error: `sponsor_users: ${suError.message}` };

  // Dohvati naziv sponzora za welcome email
  const { data: sponsorData } = await adminClient
    .from("sponsors")
    .select("name")
    .eq("id", sponsorId)
    .single();
  const sponsorName = sponsorData?.name ?? "";

  // Pošalji welcome email
  const { error: emailError } = await sendWelcomeEmail(
    email.toLowerCase().trim(),
    sponsorName,
    name.trim(),
    password,
    projectId
  );

  // Logiraj u email_logs
  await adminClient.from("email_logs").insert({
    recipient: email.toLowerCase().trim(),
    subject: `Pristup CRO Commerce ${projectId} partnerskom portalu — ${sponsorName}`,
    status: emailError ? "error" : "sent",
    sent_at: new Date().toISOString(),
  });

  return {
    emailSent: !emailError,
    partner: {
      id: suRow?.id ?? "",
      user_id: userId,
      sponsor_id: sponsorId,
      sponsor_name: sponsorName || "—",
      email: email.toLowerCase().trim(),
      name: name.trim() || null,
      projectId,
    },
  };
}

export async function changePartnerPassword(
  userId: string,
  newPassword: string,
  projectId: "2026" | "2025"
): Promise<{ error: string | null }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  const adminClient = createAdminClientForProject(projectId);
  const { error } = await adminClient.auth.admin.updateUserById(userId, { password: newPassword });
  if (error) return { error: error.message };
  return { error: null };
}

export async function deletePartnerUser(
  sponsorUsersId: string,
  userId: string,
  projectId: "2026" | "2025"
): Promise<{ error: string | null }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  // Dohvati email korisnika u izvornom projektu pa očisti OBA projekta
  const sourceClient = createAdminClientForProject(projectId);
  const { data: userData } = await sourceClient.auth.admin.getUserById(userId);
  const email = userData?.user?.email?.toLowerCase() ?? null;

  const errors: string[] = [];
  const allProjects: ProjectId[] = ["2026", "2025"];

  for (const pid of allProjects) {
    const adminClient = createAdminClientForProject(pid);

    let targetUserId: string | null = null;
    if (email) {
      const { data: listData, error: listError } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
      if (listError) {
        errors.push(`${pid} (list): ${listError.message}`);
        continue;
      }
      targetUserId = listData?.users?.find((u) => u.email?.toLowerCase() === email)?.id ?? null;
    } else if (pid === projectId) {
      // Fallback: email nije dostupan — obriši barem u izvornom projektu po userId
      targetUserId = userId;
    }

    if (!targetUserId) continue;

    const { error: suError } = await adminClient
      .from("sponsor_users")
      .delete()
      .eq("user_id", targetUserId);
    if (suError) errors.push(`${pid} (sponsor_users): ${suError.message}`);

    const { error: delError } = await adminClient.auth.admin.deleteUser(targetUserId);
    if (delError) errors.push(`${pid} (auth): ${delError.message}`);
  }

  return { error: errors.length > 0 ? errors.join("; ") : null };
}

export async function listSponsorsForSelect(): Promise<{ id: string; name: string }[]> {
  const auth = await requireAdmin();
  if (!auth.ok) return [];

  const supabase = createAdminClientForProject(auth.projectId);
  const { data } = await supabase.from("sponsors").select("id, name").order("name");
  return data ?? [];
}

export async function updatePrimaryContact(
  sponsorId: string,
  data: { contact_name: string | null; contact_email: string | null; contact_phone: string | null }
): Promise<{ error: string | null }> {
  const auth = await requireAdminOrSponsor(sponsorId);
  if (!auth.ok) return { error: auth.error };

  try {
    const adminClient = createAdminClientForProject(auth.projectId);
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
