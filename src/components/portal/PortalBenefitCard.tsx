"use client";

import { CheckCircle2, Clock, AlertTriangle, XCircle, Calendar, User, FileText, File, Phone, Mail } from "lucide-react";
import { benefitStatusLabel, benefitStatusColor, formatDate, daysUntil } from "@/lib/utils";
import type { BenefitStatus } from "@/types";

interface ContactPerson {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface BenefitFile {
  id: string;
  filename: string;
  storage_url: string;
  file_size: number | null;
}

interface Benefit {
  id: string;
  benefit_name: string;
  deadline: string | null;
  status: string;
  notes: string | null;
  assigned_to: string | null;
  description: string | null;
  contact_person: ContactPerson | null;
  files: BenefitFile[];
}

const statusIcon: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 size={15} className="text-emerald-500" />,
  in_progress: <Clock size={15} className="text-blue-500" />,
  not_started: <XCircle size={15} className="text-gray-400" />,
  overdue: <AlertTriangle size={15} className="text-red-500" />,
};

export default function PortalBenefitCard({ benefit }: { benefit: Benefit }) {
  const days = benefit.deadline ? daysUntil(benefit.deadline) : null;
  const isOverdue = benefit.deadline && new Date(benefit.deadline) < new Date() && benefit.status !== "completed" && benefit.status !== "not_started";

  return (
    <div className={`card p-4 ${isOverdue ? "border-red-200" : ""}`}>
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 mt-0.5">{statusIcon[benefit.status] ?? statusIcon.not_started}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-gray-900 text-sm">{benefit.benefit_name}</p>
            <span className={`badge text-xs flex-shrink-0 ${benefitStatusColor(benefit.status as BenefitStatus)}`}>
              {benefitStatusLabel(benefit.status as BenefitStatus)}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {benefit.deadline && (
              <span className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-600 font-medium" : "text-gray-500"}`}>
                <Calendar size={11} />
                {formatDate(benefit.deadline)}
                {days !== null && days > 0 && !isOverdue && ` · ${days}d`}
                {isOverdue && " · Rok prošao"}
              </span>
            )}
          </div>

          {benefit.description && (
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">{benefit.description}</p>
          )}

          {benefit.contact_person && (
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              <span className="flex items-center gap-1 text-xs text-gray-600 font-medium">
                <User size={11} className="text-gray-400" />
                {benefit.contact_person.name}
              </span>
              {benefit.contact_person.email && (
                <a
                  href={`mailto:${benefit.contact_person.email}`}
                  className="flex items-center gap-1 text-xs text-brand-600 hover:underline"
                >
                  <Mail size={11} />
                  {benefit.contact_person.email}
                </a>
              )}
              {benefit.contact_person.phone && (
                <a
                  href={`tel:${benefit.contact_person.phone}`}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  <Phone size={11} />
                  {benefit.contact_person.phone}
                </a>
              )}
            </div>
          )}

          {benefit.files.length > 0 && (
            <div className="mt-2 space-y-1">
              {benefit.files.map((f) => (
                <a
                  key={f.id}
                  href={f.storage_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 hover:underline"
                >
                  <File size={11} />
                  {f.filename}
                  {f.file_size && (
                    <span className="text-gray-400">({Math.round(f.file_size / 1024)}KB)</span>
                  )}
                </a>
              ))}
            </div>
          )}

          {benefit.notes && (
            <p className="flex items-start gap-1 text-xs text-gray-400 mt-2">
              <FileText size={11} className="mt-0.5 flex-shrink-0" />
              {benefit.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
