import { redirect } from "next/navigation";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import PortalSidebar from "@/components/portal/PortalSidebar";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const adminClient = await createAdminClient();

  // Admin ide na admin panel
  const { data: adminRow } = await adminClient
    .from("project_admins")
    .select("email")
    .eq("email", user.email ?? "")
    .maybeSingle();

  if (adminRow) redirect("/admin/dashboard");

  // Provjeri je li sponzor
  const { data: sponsorUser } = await adminClient
    .from("sponsor_users")
    .select("sponsor_id, sponsors(id, name, package_type)")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!sponsorUser) {
    await supabase.auth.signOut();
    redirect("/login?error=no_access");
  }

  const sponsorsRaw = sponsorUser.sponsors as unknown;
  const sponsor = (Array.isArray(sponsorsRaw) ? sponsorsRaw[0] : sponsorsRaw) as { id: string; name: string; package_type: string };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <PortalSidebar sponsor={sponsor} userEmail={user.email ?? ""} />
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="p-4 md:p-8 max-w-[1200px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
