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

export default async function BenefitsPage() {
  const supabase = await createClient();

  const [{ data: benefits }, { data: sponsors }] = await Promise.all([
    supabase
      .from("sponsor_benefits")
      .select("id, benefit_name, deadline, status, notes, sponsors(id, name, package_type)")
      .order("benefit_name"),
    supabase
      .from("sponsors")
      .select("id, name")
      .order("name"),
  ]);

  const rows = benefits ?? [];
  const sponsorList = sponsors ?? [];

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
          const count = rows.filter((b) => b.status === status).length;
          return (
            <div key={status} className="card p-4 flex items-center gap-3">
              {statusIcon[status]}
              <div>
                <p className="text-xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500">{benefitStatusLabel(status)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <BenefitsView benefits={rows as any} />
    </div>
  );
}
