import { createAdminClient } from "@/lib/supabase/server";
import ContactsView from "@/components/admin/ContactsView";

export default async function ContactsPage() {
  const supabase = await createAdminClient();

  const [{ data: existingContacts }, { data: sponsors }] = await Promise.all([
    supabase.from("sponsor_contacts").select("sponsor_id, name"),
    supabase
      .from("sponsors")
      .select("id, name, contact_name, contact_email, contact_phone")
      .order("name"),
  ]);

  // Automatski stvori sponsor_contacts za primarne kontakte koji još ne postoje
  const existingKeys = new Set(
    (existingContacts ?? []).map(
      (c) => `${c.sponsor_id}|${(c.name ?? "").toLowerCase()}`
    )
  );

  const toInsert = (sponsors ?? [])
    .filter(
      (s) =>
        s.contact_name &&
        !existingKeys.has(`${s.id}|${s.contact_name.toLowerCase()}`)
    )
    .map((s) => ({
      sponsor_id: s.id,
      name: s.contact_name as string,
      email: s.contact_email ?? null,
      phone: (s as any).contact_phone ?? null,
      type: "contact" as const,
    }));

  if (toInsert.length > 0) {
    await supabase.from("sponsor_contacts").insert(toInsert);
  }

  // Dohvati sve kontakte (uključujući upravo kreirane)
  const { data: contacts } = await supabase
    .from("sponsor_contacts")
    .select("*")
    .order("created_at");

  const sponsorList = (sponsors ?? []).map((s) => ({ id: s.id, name: s.name }));

  return <ContactsView contacts={contacts ?? []} sponsors={sponsorList} />;
}
