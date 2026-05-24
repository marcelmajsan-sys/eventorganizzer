"use server";

import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { ProjectId } from "@/lib/supabase/projects";

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

export async function notifyAdminContactAdded(
  sponsorId: string,
  contactName: string,
  contactType: "contact" | "ticket",
  projectId: ProjectId = "2026"
) {
  const projectsToTry: ProjectId[] = projectId === "2026" ? ["2026", "2025"] : ["2025", "2026"];
  const typeLabel = contactType === "contact" ? "kontakt osoba" : "osoba za ulaznice";

  console.log(`notifyAdminContactAdded: start sponsorId=${sponsorId} type=${contactType} projectId=${projectId}`);

  for (const pid of projectsToTry) {
    try {
      const adminClient = createAdminClientForProject(pid);

      const { data: sponsor, error: sponsorErr } = await adminClient
        .from("sponsors")
        .select("name")
        .eq("id", sponsorId)
        .single();

      if (sponsorErr || !sponsor) {
        console.error(`notifyAdminContactAdded [${pid}]: sponsor not found`, sponsorErr?.message);
        continue;
      }

      const { error: insertErr } = await adminClient.from("notifications").insert({
        sponsor_id: sponsorId,
        title: contactType === "contact" ? "Nova kontakt osoba" : "Nova osoba za ulaznice",
        message: `${sponsor.name}: dodana ${typeLabel} — ${contactName}`,
      });

      if (insertErr) {
        console.error(`notifyAdminContactAdded [${pid}]: insert failed`, insertErr.message);
        continue;
      }

      console.log(`notifyAdminContactAdded [${pid}]: success`);
      return;
    } catch (e) {
      console.error(`notifyAdminContactAdded [${pid}]: unexpected error`, e);
    }
  }

  console.error(`notifyAdminContactAdded: all projects failed for sponsorId=${sponsorId}`);
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

export async function markNotificationRead(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) return;
  const adminClient = await createAdminClient();
  await adminClient
    .from("notification_reads")
    .upsert({ notification_id: id, user_id: userId }, { onConflict: "notification_id,user_id" });
}

export async function markNotificationUnread(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) return;
  const adminClient = await createAdminClient();
  await adminClient
    .from("notification_reads")
    .delete()
    .eq("notification_id", id)
    .eq("user_id", userId);
}

export async function deleteNotification(id: string) {
  const adminClient = await createAdminClient();
  await adminClient.from("notifications").delete().eq("id", id);
}

export async function deleteAllNotifications() {
  const adminClient = await createAdminClient();
  await adminClient.from("notifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
}

export async function markAllNotificationsRead() {
  const userId = await getCurrentUserId();
  if (!userId) return;
  const adminClient = await createAdminClient();

  // Dohvati sve notification ID-eve kojih još nema u reads za ovog usera
  const { data: allNotifs } = await adminClient.from("notifications").select("id");
  if (!allNotifs || allNotifs.length === 0) return;

  const { data: existing } = await adminClient
    .from("notification_reads")
    .select("notification_id")
    .eq("user_id", userId);

  const existingSet = new Set((existing ?? []).map((r: any) => r.notification_id));
  const toInsert = allNotifs
    .filter((n: any) => !existingSet.has(n.id))
    .map((n: any) => ({ notification_id: n.id, user_id: userId }));

  if (toInsert.length > 0) {
    await adminClient.from("notification_reads").insert(toInsert);
  }
}
