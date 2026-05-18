import { createAdminClient, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PortalPartnerTabs from "@/components/portal/PortalPartnerTabs";

export default async function PortalSponsorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const adminClient = await createAdminClient();
  const { data: sponsorUser } = await adminClient
    .from("sponsor_users")
    .select("sponsor_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!sponsorUser) redirect("/login");

  const [{ data: sponsor }, { data: contacts }, { data: files }] = await Promise.all([
    adminClient.from("sponsors").select("*").eq("id", sponsorUser.sponsor_id).single(),
    adminClient.from("sponsor_contacts").select("*").eq("sponsor_id", sponsorUser.sponsor_id).order("created_at"),
    adminClient.from("files").select("*").eq("sponsor_id", sponsorUser.sponsor_id).order("uploaded_at", { ascending: false }),
  ]);

  if (!sponsor) redirect("/login");

  return (
    <div className="animate-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Moj partner</h1>
          <p className="page-subtitle">Informacije o vašem partnerstvu</p>
        </div>
      </div>

      <PortalPartnerTabs
        sponsorId={sponsorUser.sponsor_id}
        sponsor={sponsor}
        contacts={contacts ?? []}
        files={files ?? []}
      />
    </div>
  );
}
