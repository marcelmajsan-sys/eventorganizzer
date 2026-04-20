import { createAdminClient, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock, AlertTriangle, XCircle, Gift } from "lucide-react";
import Link from "next/link";
import { benefitStatusLabel, benefitStatusColor } from "@/lib/utils";
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

  const { data: benefits } = await adminClient
    .from("sponsor_benefits")
    .select("id, benefit_name, deadline, status, notes, assigned_to")
    .eq("sponsor_id", sponsorUser.sponsor_id)
    .order("deadline");

  const rows = benefits ?? [];
  const completed = rows.filter((b) => b.status === "completed").length;
  const total = rows.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const activeStatus = searchParams.status as BenefitStatus | undefined;
  const filtered = activeStatus ? rows.filter((b) => b.status === activeStatus) : rows;

  return (
    <div className="animate-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Moji benefiti</h1>
          <p className="page-subtitle">Pregled vaših sponzorskih benefita</p>
        </div>
      </div>

      {/* Progress summary */}
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

        {/* Status kartice */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {STATUSES.map((status) => {
            const count = rows.filter((b) => b.status === status).length;
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

      {/* Lista benefita */}
      <div className="space-y-3">
        {filtered.map((benefit) => (
          <PortalBenefitCard key={benefit.id} benefit={benefit} />
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
