"use server";

import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import { createAdminClient } from "@/lib/supabase/server";
import type { ProjectId } from "@/lib/supabase/projects";

export async function notifyAdminContactAdded(
  sponsorId: string,
  contactName: string,
  contactType: "contact" | "ticket",
  projectId: ProjectId = "2026"
) {
  // Try the passed project first, then the other — handles cases where
  // cro_active_project cookie is missing or set to the wrong project.
  const projectsToTry: ProjectId[] = projectId === "2026" ? ["2026", "2025"] : ["2025", "2026"];
  const typeLabel = contactType === "contact" ? "kontakt osoba" : "osoba za ulaznice";

  for (const pid of projectsToTry) {
    try {
      const adminClient = createAdminClientForProject(pid);

      const { data: sponsor, error: sponsorErr } = await adminClient
        .from("sponsors")
        .select("name")
        .eq("id", sponsorId)
        .single();

      if (sponsorErr || !sponsor) {
        console.error(`notifyAdminContactAdded [${pid}]: sponsor not found for ${sponsorId}`, sponsorErr?.message);
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

      return; // success
    } catch (e) {
      console.error(`notifyAdminContactAdded [${pid}]: unexpected error`, e);
    }
  }
}

export async function markNotificationRead(id: string) {
  const adminClient = await createAdminClient();
  await adminClient.from("notifications").update({ read: true }).eq("id", id);
}

export async function markAllNotificationsRead() {
  const adminClient = await createAdminClient();
  await adminClient.from("notifications").update({ read: true }).eq("read", false);
}
