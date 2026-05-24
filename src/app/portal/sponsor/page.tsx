import { createAdminClient, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PortalPartnerTabs from "@/components/portal/PortalPartnerTabs";

export default async function PortalSponsorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const adminClient = await createAdminClient();

  // select * so new columns (contract_accepted_at/by) are included if migration ran
  const { data: sponsorUser } = await adminClient
    .from("sponsor_users")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!sponsorUser) redirect("/login");

  const [{ data: sponsor }, { data: contacts }, { data: files }] = await Promise.all([
    adminClient.from("sponsors").select("*").eq("id", sponsorUser.sponsor_id).single(),
    adminClient.from("sponsor_contacts").select("*").eq("sponsor_id", sponsorUser.sponsor_id).order("created_at"),
    adminClient.from("files").select("*").eq("sponsor_id", sponsorUser.sponsor_id).order("uploaded_at", { ascending: false }),
  ]);

  if (!sponsor) redirect("/login");

  // Graceful degradation: columns may not exist before migration_035
  const su = sponsorUser as Record<string, unknown>;
  const contractAcceptedAt = (su.contract_accepted_at as string | null) ?? null;
  const contractAcceptedBy = (su.contract_accepted_by as string | null) ?? null;

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
        userEmail={user.email ?? ""}
        contractAcceptedAt={contractAcceptedAt}
        contractAcceptedBy={contractAcceptedBy}
      />
    </div>
  );
}
