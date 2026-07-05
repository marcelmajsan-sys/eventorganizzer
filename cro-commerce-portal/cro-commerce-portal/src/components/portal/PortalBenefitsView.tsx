"use client";

import { CheckCircle2, Clock, AlertTriangle, XCircle, Gift } from "lucide-react";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import PortalBenefitCard from "@/components/portal/PortalBenefitCard";
import type { BenefitStatus } from "@/types";

const statusIcon: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 size={15} className="text-emerald-500" />,
  in_progress: <Clock size={15} className="text-blue-500" />,
  not_started: <XCircle size={15} className="text-gray-400" />,
  overdue: <AlertTriangle size={15} className="text-red-500" />,
};

const STATUSES: BenefitStatus[] = ["not_started", "in_progress", "completed", "overdue"];

interface BenefitRow {
  id: string;
  benefit_name: string;
  deadline: string | null;
  status: string;
  notes: string | null;
  assigned_to: string | null;
  description: string | null;
  contact_person: { id: string; name: string; email: string | null; phone: string | null } | null;
  files: { id: string; filename: string; storage_url: string; file_size: number | null }[];
}

interface Props {
  enrichedRows: BenefitRow[];
  activeStatus: BenefitStatus | undefined;
}

export default function PortalBenefitsView({ enrichedRows, activeStatus }: Props) {
  const { t } = useLang();

  const completed = enrichedRows.filter((b) => b.status === "completed").length;
  const total = enrichedRows.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const filtered = activeStatus ? enrichedRows.filter((b) => b.status === activeStatus) : enrichedRows;

  return (
    <div className="animate-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("benefits.title")}</h1>
          <p className="page-subtitle">{t("benefits.subtitle")}</p>
        </div>
      </div>

      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">{t("benefits.delivery")}</span>
          <span className="text-sm font-bold text-gray-900">
            {completed}/{total} {t("benefits.completedOf")} ({pct}%)
          </span>
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
            const statusKey = `status.${status}` as Parameters<typeof t>[0];
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
                  <p className="text-xs text-gray-500">{t(statusKey)}</p>
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
              {activeStatus ? t("benefits.emptyStatus") : t("benefits.empty")}
            </p>
            {activeStatus && (
              <Link href="/portal/benefits" className="text-xs text-brand-600 hover:underline mt-2 block">
                {t("benefits.showAll")}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
