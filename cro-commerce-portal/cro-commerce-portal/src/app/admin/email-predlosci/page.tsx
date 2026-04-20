import { createClient } from "@/lib/supabase/server";
import EmailTemplatesView from "@/components/admin/EmailTemplatesView";

export default async function EmailTemplatesPage() {
  const supabase = await createClient();
  const { data: templates } = await supabase
    .from("email_templates")
    .select("*")
    .order("created_at", { ascending: false });

  return <EmailTemplatesView templates={templates ?? []} />;
}
