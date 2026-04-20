"use client";

import { CheckCircle2, Clock, AlertTriangle, XCircle, Calendar, User, FileText } from "lucide-react";
import { benefitStatusLabel, benefitStatusColor, formatDate, daysUntil } from "@/lib/utils";
import type { BenefitStatus } from "@/types";

interface Benefit {
  id: string;
  benefit_name: string;
  deadline: string | null;
  status: string;
  notes: string | null;
  assigned_to: string | null;
}

const statusIcon: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 size={15} className="text-emerald-500" />,
  in_progress: <Clock size={15} className="text-blue-500" />,
  not_started: <XCircle size={15} className="text-gray-400" />,
  overdue: <AlertTriangle size={15} className="text-red-500" />,
};

export default function PortalBenefitCard({ benefit }: { benefit: Benefit }) {
  const days = benefit.deadline ? daysUntil(benefit.deadline) : null;
  const isOverdue = benefit.deadline && new Date(benefit.deadline) < new Date() && benefit.status !== "completed";

  return (
    <div className={`card p-4 ${isOverdue ? "border-red-200" : ""}`}>
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 mt-0.5">{statusIcon[benefit.status] ?? statusIcon.not_started}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm">{benefit.benefit_name}</p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {benefit.deadline && (
              <span className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-600 font-medium" : "text-gray-500"}`}>
                <Calendar size={11} />
                {formatDate(benefit.deadline)}
                {days !== null && days > 0 && !isOverdue && ` · ${days}d`}
                {isOverdue && " · Rok prošao"}
              </span>
            )}
            {benefit.assigned_to && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <User size={11} />
                {benefit.assigned_to}
              </span>
            )}
          </div>
          {benefit.notes && (
            <p className="flex items-start gap-1 text-xs text-gray-500 mt-2">
              <FileText size={11} className="mt-0.5 flex-shrink-0" />
              {benefit.notes}
            </p>
          )}
        </div>
        <span className={`badge text-xs flex-shrink-0 ${benefitStatusColor(benefit.status as BenefitStatus)}`}>
          {benefitStatusLabel(benefit.status as BenefitStatus)}
        </span>
      </div>
    </div>
  );
}
