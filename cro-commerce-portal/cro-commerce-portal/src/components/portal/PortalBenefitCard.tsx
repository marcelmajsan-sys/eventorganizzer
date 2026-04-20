"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, AlertTriangle, XCircle, ChevronDown, ChevronUp, Calendar, User, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
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

const STATUSES: BenefitStatus[] = ["not_started", "in_progress", "completed", "overdue"];

export default function PortalBenefitCard({ benefit }: { benefit: Benefit }) {
  const router = useRouter();
  const supabase = createClient();
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(benefit.status as BenefitStatus);
  const [notes, setNotes] = useState(benefit.notes ?? "");
  const [assignedTo, setAssignedTo] = useState(benefit.assigned_to ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const days = benefit.deadline ? daysUntil(benefit.deadline) : null;
  const isOverdue = benefit.deadline && new Date(benefit.deadline) < new Date() && status !== "completed";

  async function handleSave() {
    setSaving(true);
    await supabase
      .from("sponsor_benefits")
      .update({
        status,
        notes: notes || null,
        assigned_to: assignedTo || null,
      })
      .eq("id", benefit.id);
    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className={`card overflow-hidden ${isOverdue ? "border-red-200" : ""}`}>
      {/* Header row */}
      <div
        className="p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="flex-shrink-0">{statusIcon[status] ?? statusIcon.not_started}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm">{benefit.benefit_name}</p>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
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
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`badge text-xs ${benefitStatusColor(status as BenefitStatus)}`}>
            {benefitStatusLabel(status as BenefitStatus)}
          </span>
          {expanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </div>

      {/* Expanded edit panel */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50/50 space-y-4">
          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    status === s
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {benefitStatusLabel(s)}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              <span className="flex items-center gap-1"><FileText size={11} />Napomene</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Dodajte napomenu..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-400 resize-none bg-white"
            />
          </div>

          {/* Assigned to */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              <span className="flex items-center gap-1"><User size={11} />Odgovorna osoba</span>
            </label>
            <input
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="Ime i prezime..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-400 bg-white"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary text-sm px-4 py-2"
            >
              {saving ? "Spremanje..." : "Spremi"}
            </button>
            {saved && <span className="text-xs text-emerald-600 font-medium">Spremljeno!</span>}
          </div>
        </div>
      )}
    </div>
  );
}
