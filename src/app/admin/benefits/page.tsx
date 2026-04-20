import { createClient } from "@/lib/supabase/server";
import { CheckCircle2, Clock, AlertTriangle, XCircle } from "lucide-react";
import { benefitStatusLabel } from "@/lib/utils";
import type { BenefitStatus } from "@/types";
import BenefitsView from "@/components/admin/BenefitsView";
import AddBenefitModal from "@/components/admin/AddBenefitModal";
import Link from "next/link";

const statusIcon = {
  completed: <CheckCircle2 size={16} className="text-emerald-500" />,
  in_progress: <Clock size={16} className="text-blue-500" />,
  not_started: <XCircle size={16} className="text-gray-400" />,
  overdue: <AlertTriangle size={16} className="text-red-500" />,
};

export default async function BenefitsPage({ searchParams }: { searchParams: { status?: string } }) {
  const activeStatus = searchParams.status ?? null;
  const supabase = await createClient();

  // Automatski označi benefite s prošlim rokom kao "overdue"
  await supabase
    .from("sponsor_benefits")
    .update({ status: "overdue" })
    .lt("deadline", new Date().toISOString())
    .not("status", "in", '("completed","overdue")');

  const [{ data: benefits }, { data: sponsors }, { data: emailLogs }] = await Promise.all([
    supabase
      .from("sponsor_benefits")
      .select("id, benefit_name, deadline, status, notes, assigned_to, sponsors(id, name, package_type)")
      .order("benefit_name"),
    supabase
      .from("sponsors")
      .select("id, name, package_type")
      .order("name"),
    supabase
      .from("email_logs")
      .select("benefit_id, sent_at")
      .order("sent_at", { ascending: false }),
  ]);

  const lastRemindedMap: Record<string, string> = {};
  emailLogs?.forEach((log) => {
    if (log.benefit_id && !lastRemindedMap[log.benefit_id]) {
      lastRemindedMap[log.benefit_id] = log.sent_at;
    }
  });

  const rows = (benefits ?? []).map((b) => ({
    ...b,
    last_reminded_at: lastRemindedMap[b.id] ?? null,
  }));
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
          const isActive = activeStatus === status;
          return (
            <Link
              key={status}
              href={isActive ? "/admin/benefits" : `/admin/benefits?status=${status}`}
              className={`card p-4 flex items-center gap-3 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer ${isActive ? "ring-2 ring-brand-500 bg-brand-50/30" : ""}`}
            >
              {statusIcon[status]}
              <div>
                <p className="text-xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500">{benefitStatusLabel(status)}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <BenefitsView benefits={rows as any} filterStatus={activeStatus} />
    </div>
  );
}
