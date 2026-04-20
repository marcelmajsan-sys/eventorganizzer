import { createClient } from "@/lib/supabase/server";
import AutomatizacijaView from "@/components/admin/AutomatizacijaView";

export default async function AutomatizacijaPage() {
  const supabase = await createClient();

  const [{ data: automations }, { data: templates }] = await Promise.all([
    supabase.from("email_automations").select("*, email_templates(name)").order("created_at", { ascending: false }),
    supabase.from("email_templates").select("id, name").eq("is_active", true).order("name"),
  ]);

  return <AutomatizacijaView automations={automations ?? []} templates={templates ?? []} />;
}
