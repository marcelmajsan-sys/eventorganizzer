import { createClient } from "@/lib/supabase/server";
import ContactsView from "@/components/admin/ContactsView";

export default async function ContactsPage() {
  const supabase = await createClient();

  const [{ data: contacts }, { data: sponsors }] = await Promise.all([
    supabase.from("sponsor_contacts").select("*").order("created_at"),
    supabase.from("sponsors").select("id, name").order("name"),
  ]);

  return <ContactsView contacts={contacts ?? []} sponsors={sponsors ?? []} />;
}
