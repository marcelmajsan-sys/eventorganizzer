import { createAdminClient, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PortalPartnerTabs from "@/components/portal/PortalPartnerTabs";
import PortalPageHeader from "@/components/portal/PortalPageHeader";
import { parseTicketQuota } from "@/lib/ticketQuota";

export default async function PortalSponsorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const adminClient = await createAdminClient();

  const { data: sponsorUser } = await adminClient
    .from("sponsor_users")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!sponsorUser) redirect("/");

  const [
    { data: sponsor },
    { data: contacts },
    { data: files },
    { data: benefits },
  ] = await Promise.all([
    adminClient.from("sponsors").select("*").eq("id", sponsorUser.sponsor_id).single(),
    adminClient.from("sponsor_contacts").select("id, name, email, phone, role, type, ticket_type, slug").eq("sponsor_id", sponsorUser.sponsor_id).order("created_at"),
    adminClient.from("files").select("*").eq("sponsor_id", sponsorUser.sponsor_id).order("uploaded_at", { ascending: false }),
    adminClient.from("sponsor_benefits").select("benefit_name, description").eq("sponsor_id", sponsorUser.sponsor_id).order("benefit_name"),
  ]);

  if (!sponsor) redirect("/");

  const su = sponsorUser as Record<string, unknown>;
  const contractAcceptedAt = (su.contract_accepted_at as string | null) ?? null;
  const contractAcceptedBy = (su.contract_accepted_by as string | null) ?? null;

  // Izgradimo tekstualne stavke za Čl. 2 iz stvarnih dodijeljenih benefita
  const contractBenefits: string[] = (benefits ?? []).map((b: Record<string, unknown>) => {
    const name = (b.benefit_name as string) ?? "";
    const desc = (b.description as string | null) ?? null;
    return desc ? `${name} — ${desc}` : name;
  });

  // Limit ulaznica partnera dolazi iz njegovih benefita (lib/ticketQuota.ts)
  const ticketQuota = parseTicketQuota(
    (benefits ?? []).map((b: Record<string, unknown>) => b.benefit_name as string | null)
  );

  return (
    <div className="animate-enter">
      <PortalPageHeader titleKey="partner.title" subtitleKey="partner.subtitle" />

      <PortalPartnerTabs
        sponsorId={sponsorUser.sponsor_id}
        sponsor={sponsor}
        contacts={contacts ?? []}
        files={files ?? []}
        userEmail={user.email ?? ""}
        contractAcceptedAt={contractAcceptedAt}
        contractAcceptedBy={contractAcceptedBy}
        contractBenefits={contractBenefits}
        ticketQuota={ticketQuota}
      />
    </div>
  );
}
