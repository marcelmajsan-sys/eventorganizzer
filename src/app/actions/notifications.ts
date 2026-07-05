"use server";

import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { PROJECT_COOKIE, resolveProjectId } from "@/lib/supabase/projects";
import type { ProjectId } from "@/lib/supabase/projects";
import { requireAdmin, SUPER_ADMIN_EMAIL } from "@/lib/authGuards";

async function getProjectAdminClient() {
  const cookieStore = await cookies();
  const projectId = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);
  return createAdminClientForProject(projectId);
}

export async function recordPartnerLogin(
  userId: string, email: string, projectId: ProjectId
): Promise<{ ok: boolean; debug: string }> {
  try {
    const adminClient = createAdminClientForProject(projectId);

    // Korak 1: dohvati sponsor_users
    const { data: sponsorUser, error: suErr } = await adminClient
      .from("sponsor_users")
      .select("sponsor_id, sponsors(name)")
      .eq("user_id", userId)
      .maybeSingle();

    if (suErr) return { ok: false, debug: `sponsor_users error: ${suErr.message}` };
    if (!sponsorUser) return { ok: false, debug: `no sponsor_users row for userId=${userId} in project=${projectId}` };

    const sponsorsRaw = sponsorUser.sponsors as unknown;
    const sponsor = (Array.isArray(sponsorsRaw) ? sponsorsRaw[0] : sponsorsRaw) as { name: string } | null;
    const sponsorName = sponsor?.name ?? "Nepoznati partner";

    // Korak 2: pozovi SECURITY DEFINER RPC (migration_035)
    const { error: rpcErr } = await adminClient.rpc("record_partner_login_notification", {
      p_sponsor_id: sponsorUser.sponsor_id,
      p_sponsor_name: sponsorName,
      p_email: email,
    });

    if (rpcErr) {
      // Fallback: direktni INSERT ako RPC funkcija ne postoji (migracija još nije pokrenuta)
      const { error: insertErr } = await adminClient.from("notifications").insert({
        sponsor_id: sponsorUser.sponsor_id,
        title: "Prijava partnera",
        message: `${sponsorName} (${email}) se prijavio/la u portal`,
      });
      if (insertErr) return { ok: false, debug: `rpc: ${rpcErr.message} | insert: ${insertErr.message}` };
      return { ok: true, debug: `fallback insert ok (rpc error: ${rpcErr.message})` };
    }

    return { ok: true, debug: `rpc ok, sponsor=${sponsorName}` };
  } catch (e: any) {
    return { ok: false, debug: `exception: ${e?.message ?? e}` };
  }
}

async function getCurrentUserId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

export async function markNotificationRead(id: string): Promise<{ error: string | null }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Niste prijavljeni." };
  const adminClient = await getProjectAdminClient();
  await adminClient
    .from("notification_reads")
    .upsert({ notification_id: id, user_id: userId }, { onConflict: "notification_id,user_id" });
  return { error: null };
}

export async function markNotificationUnread(id: string): Promise<{ error: string | null }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Niste prijavljeni." };
  const adminClient = await getProjectAdminClient();
  await adminClient
    .from("notification_reads")
    .delete()
    .eq("notification_id", id)
    .eq("user_id", userId);
  return { error: null };
}

export async function deleteNotification(id: string): Promise<{ error: string | null }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  const adminClient = createAdminClientForProject(auth.projectId);
  await adminClient.from("notifications").delete().eq("id", id);
  return { error: null };
}

export async function deleteAllNotifications(): Promise<{ error: string | null }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };
  if (auth.user.email !== SUPER_ADMIN_EMAIL) {
    return { error: "Samo glavni administrator može obrisati sve obavijesti." };
  }

  const adminClient = createAdminClientForProject(auth.projectId);
  await adminClient.from("notifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  return { error: null };
}

export async function markAllNotificationsRead(): Promise<{ error: string | null }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Niste prijavljeni." };
  const adminClient = await getProjectAdminClient();

  const { data: allNotifs } = await adminClient.from("notifications").select("id");
  if (!allNotifs || allNotifs.length === 0) return { error: null };

  // Upsert umjesto read-then-insert — izbjegava race condition na duplikatima
  const rows = allNotifs.map((n: any) => ({ notification_id: n.id, user_id: userId }));
  await adminClient
    .from("notification_reads")
    .upsert(rows, { onConflict: "notification_id,user_id" });
  return { error: null };
}
