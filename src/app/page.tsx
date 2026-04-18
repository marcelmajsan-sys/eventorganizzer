import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAILS = [
  "marcel@ecommerce.hr",
  "udruga@ecommerce.hr",
  "laura@ecommerce.hr",
];

export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (ADMIN_EMAILS.includes(user.email ?? "")) {
    redirect("/admin/dashboard");
  }

  redirect("/portal");
}
