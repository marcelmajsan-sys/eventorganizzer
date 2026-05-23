"use server";

import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { ProjectId } from "@/lib/supabase/projects";

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
