import { createAdminClient, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock, AlertTriangle, XCircle, Gift } from "lucide-react";
import Link from "next/link";
import { benefitStatusLabel } from "@/lib/utils";
import type { BenefitStatus } from "@/types";
import PortalBenefitCard from "@/components/portal/PortalBenefitCard";

const statusIcon: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 size={15} className="text-emerald-500" />,
  in_progress: <Clock size={15} className="text-blue-500" />,
  not_started: <XCircle size={15} className="text-gray-400" />,
  overdue: <AlertTriangle size={15} className="text-red-500" />,
};

const STATUSES: BenefitStatus[] = ["not_started", "in_progress", "completed", "overdue"];

export default async function PortalBenefitsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
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
  let adminMap: Record<string, { name: string | null; phone: string | null }> = {};

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

  // Dohvati ime i telefon admin korisnika za assigned_to emaile
  try {
    const { createAdminClientForProject } = await import("@/lib/supabase/adminProjectClient");
    const { PROJECT_COOKIE, resolveProjectId } = await import("@/lib/supabase/projects");
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const projectId = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);
    const adminAuthClient = createAdminClientForProject(projectId);

    const seen = new Set<string>();
    const assignedEmails: string[] = [];
    rows.forEach((b) => { if (b.assigned_to && !seen.has(b.assigned_to)) { seen.add(b.assigned_to); assignedEmails.push(b.assigned_to); } });
    if (assignedEmails.length > 0) {
      const { data: authUsers } = await adminAuthClient.auth.admin.listUsers({ perPage: 500 });
      (authUsers?.users ?? []).forEach((u) => {
        if (u.email && assignedEmails.includes(u.email)) {
          adminMap[u.email] = {
            name: u.user_metadata?.name ?? null,
            phone: u.user_metadata?.phone ?? null,
          };
        }
      });
    }
  } catch {}

  const enrichedRows = rows.map((b) => {
    const contactPersonId = (b as any).contact_person_id ?? null;
    const assignedEmail = b.assigned_to ?? null;
    return {
      ...b,
      description: (b as any).description ?? null,
      contact_person: contactPersonId ? (contactMap[contactPersonId] ?? null) : null,
      assigned_to_name: assignedEmail ? (adminMap[assignedEmail]?.name ?? null) : null,
      assigned_to_phone: assignedEmail ? (adminMap[assignedEmail]?.phone ?? null) : null,
      files: filesMap[b.id] ?? [],
    };
  });

  const completed = enrichedRows.filter((b) => b.status === "completed").length;
  const total = enrichedRows.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const activeStatus = searchParams.status as BenefitStatus | undefined;
  const filtered = activeStatus ? enrichedRows.filter((b) => b.status === activeStatus) : enrichedRows;

  return (
    <div className="animate-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Moji benefiti</h1>
          <p className="page-subtitle">Pregled vaših sponzorskih benefita</p>
        </div>
      </div>

      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Isporuka benefita</span>
          <span className="text-sm font-bold text-gray-900">{completed}/{total} završeno ({pct}%)</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className="bg-brand-500 h-2.5 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {STATUSES.map((status) => {
            const count = enrichedRows.filter((b) => b.status === status).length;
            const isActive = activeStatus === status;
            return (
              <Link
                key={status}
                href={isActive ? "/portal/benefits" : `/portal/benefits?status=${status}`}
                className={`flex items-center gap-2 p-3 rounded-lg transition-colors border ${
                  isActive
                    ? "bg-brand-50 border-brand-200"
                    : "bg-gray-50 border-transparent hover:bg-gray-100"
                }`}
              >
                {statusIcon[status]}
                <div>
                  <p className="text-lg font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-500">{benefitStatusLabel(status)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((benefit) => (
          <PortalBenefitCard key={benefit.id} benefit={benefit as any} />
        ))}
        {filtered.length === 0 && (
          <div className="card p-12 text-center">
            <Gift size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              {activeStatus ? `Nema benefita s ovim statusom` : "Nema definiranih benefita"}
            </p>
            {activeStatus && (
              <Link href="/portal/benefits" className="text-xs text-brand-600 hover:underline mt-2 block">
                Prikaži sve
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
