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
  const adminClient = createAdminClientForProject(projectId);

  const { data: sponsor } = await adminClient
    .from("sponsors")
    .select("name")
    .eq("id", sponsorId)
    .single();

  const sponsorName = sponsor?.name ?? "Nepoznati sponzor";
  const typeLabel = contactType === "contact" ? "kontakt osoba" : "osoba za ulaznice";

  await adminClient.from("notifications").insert({
    sponsor_id: sponsorId,
    title: contactType === "contact" ? "Nova kontakt osoba" : "Nova osoba za ulaznice",
    message: `${sponsorName}: dodana ${typeLabel} — ${contactName}`,
  });
}

export async function markNotificationRead(id: string) {
  const adminClient = await createAdminClient();
  await adminClient.from("notifications").update({ read: true }).eq("id", id);
}

export async function markAllNotificationsRead() {
  const adminClient = await createAdminClient();
  await adminClient.from("notifications").update({ read: true }).eq("read", false);
}
