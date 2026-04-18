import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PortalHeader from "@/components/portal/PortalHeader";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch sponsor by email
  const { data: sponsor } = await supabase
    .from("sponsors")
    .select("*")
    .eq("contact_email", user.email)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalHeader sponsor={sponsor} userEmail={user.email ?? ""} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
