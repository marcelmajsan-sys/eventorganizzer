import { createAdminClient } from "@/lib/supabase/server";
import ContactsView from "@/components/admin/ContactsView";

export default async function ContactsPage() {
  const supabase = await createAdminClient();

  const [{ data: contacts }, { data: sponsors }] = await Promise.all([
    supabase.from("sponsor_contacts").select("*").order("created_at"),
    supabase.from("sponsors").select("id, name, contact_name, contact_email, contact_phone").order("name"),
  ]);

  // Primarne kontakte iz sponsors tablice pretvaramo u virtualne retke
  const primaryContacts = (sponsors ?? [])
    .filter((s) => s.contact_name)
    .map((s) => ({
      id: `primary_${s.id}`,
      sponsor_id: s.id,
      name: s.contact_name as string,
      email: s.contact_email ?? null,
      phone: (s as any).contact_phone ?? null,
      role: null,
      company: null,
      type: "primary",
    }));

  // Spoji — sponsor_contacts prvi, zatim primarni
  const allContacts = [...(contacts ?? []), ...primaryContacts];

  const sponsorList = (sponsors ?? []).map((s) => ({ id: s.id, name: s.name }));

  return <ContactsView contacts={allContacts} sponsors={sponsorList} />;
}
