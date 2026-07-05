import { createAdminClient, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { BenefitStatus } from "@/types";
import PortalBenefitsView from "@/components/portal/PortalBenefitsView";

export default async function PortalBenefitsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const adminClient = await createAdminClient();
  const { data: sponsorUser } = await adminClient
    .from("sponsor_users")
    .select("sponsor_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!sponsorUser) redirect("/");

  // Try with new columns (migration_018); fall back without them if not yet migrated
  let { data: benefits, error: benefitErr } = await adminClient
    .from("sponsor_benefits")
    .select("id, benefit_name, deadline, status, notes, assigned_to, description, contact_person_id")
    .eq("sponsor_id", sponsorUser.sponsor_id)
    .order("deadline");

  if (benefitErr) {
    const { data: fallback } = await adminClient
      .from("sponsor_benefits")
      .select("id, benefit_name, deadline, status, notes, assigned_to")
      .eq("sponsor_id", sponsorUser.sponsor_id)
      .order("deadline");
    benefits = fallback as any;
  }

  const rows = benefits ?? [];
  const benefitIds = rows.map((b) => b.id);

  let filesMap: Record<string, { id: string; filename: string; storage_url: string; file_size: number | null }[]> = {};
  let contactMap: Record<string, { id: string; name: string; email: string | null; phone: string | null }> = {};

  try {
    if (benefitIds.length > 0) {
      const { data: benefitFiles } = await adminClient
        .from("files")
        .select("id, filename, storage_url, file_size, benefit_id")
        .in("benefit_id", benefitIds);
      (benefitFiles ?? []).forEach((f) => {
        if (f.benefit_id) {
          if (!filesMap[f.benefit_id]) filesMap[f.benefit_id] = [];
          filesMap[f.benefit_id]!.push({ id: f.id, filename: f.filename, storage_url: f.storage_url, file_size: f.file_size });
        }
      });
    }
  } catch {}

  try {
    const contactIds = rows
      .filter((b) => (b as any).contact_person_id)
      .map((b) => (b as any).contact_person_id as string);
    if (contactIds.length > 0) {
      const { data: contactPersons } = await adminClient
        .from("sponsor_contacts")
        .select("id, name, email, phone")
        .in("id", contactIds);
      (contactPersons ?? []).forEach((c) => { contactMap[c.id] = c; });
    }
  } catch {}

  const enrichedRows = rows.map((b) => {
    const contactPersonId = (b as any).contact_person_id ?? null;
    return {
      ...b,
      description: (b as any).description ?? null,
      contact_person: contactPersonId ? (contactMap[contactPersonId] ?? null) : null,
      files: filesMap[b.id] ?? [],
    };
  });

  const activeStatus = searchParams.status as BenefitStatus | undefined;

  return <PortalBenefitsView enrichedRows={enrichedRows as any} activeStatus={activeStatus} />;
}
