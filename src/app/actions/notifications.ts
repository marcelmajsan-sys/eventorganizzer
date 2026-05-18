"use server";

import { createAdminClient } from "@/lib/supabase/server";

export async function notifyAdminContactAdded(
  sponsorId: string,
  contactName: string,
  contactType: "contact" | "ticket"
) {
  try {
    const adminClient = await createAdminClient();

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
  } catch {
    // Notifikacija nije kritična, tiho ignoriraj greške
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
