import { createClient } from "@/lib/supabase/server";
import { CheckCircle2, Clock, AlertTriangle, XCircle } from "lucide-react";
import { benefitStatusLabel } from "@/lib/utils";
import type { BenefitStatus } from "@/types";
import BenefitsView from "@/components/admin/BenefitsView";
import AddBenefitModal from "@/components/admin/AddBenefitModal";

const statusIcon = {
  completed: <CheckCircle2 size={16} className="text-emerald-500" />,
  in_progress: <Clock size={16} className="text-blue-500" />,
  not_started: <XCircle size={16} className="text-gray-400" />,
  overdue: <AlertTriangle size={16} className="text-red-500" />,
};

export default async function BenefitsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const supabase = await createClient();
  const { status: statusFilter } = await searchParams;

  const [{ data: benefits }, { data: sponsors }] = await Promise.all([
    supabase
      .from("sponsor_benefits")
      .select("id, benefit_name, deadline, status, notes, sponsors(id, name, package_type)")
      .order("benefit_name"),
    supabase
      .from("sponsors")
      .select("id, name, package_type")
      .order("name"),
  ]);

  const allRows = benefits ?? [];
  const sponsorList = sponsors ?? [];
  const rows = statusFilter ? allRows.filter((b) => b.status === statusFilter) : allRows;

  return (
    <div className="animate-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Benefiti</h1>
          <p className="page-subtitle">Pregled svih benefita i sponzori koji ih imaju</p>
        </div>
        <AddBenefitModal sponsors={sponsorList} />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {(["not_started", "in_progress", "completed", "overdue"] as BenefitStatus[]).map((status) => {
          const count = allRows.filter((b) => b.status === status).length;
          const isActive = statusFilter === status;
          return (
            <a
              key={status}
              href={isActive ? "/admin/benefits" : `/admin/benefits?status=${status}`}
              className={`card p-4 flex items-center gap-3 hover:shadow-md transition-shadow border ${
                isActive ? "border-brand-400 bg-brand-50" : "border-transparent hover:border-brand-200"
              }`}
            >
              {statusIcon[status]}
              <div>
                <p className="text-xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500">{benefitStatusLabel(status)}</p>
              </div>
            </a>
          );
        })}
      </div>

      <BenefitsView benefits={rows as any} />
    </div>
  );
}
