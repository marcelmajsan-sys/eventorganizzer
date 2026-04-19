"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { X, Loader2, User } from "lucide-react";
import type { BenefitStatus } from "@/types";

export type EditableBenefit = {
  id: string;
  benefit_name: string;
  deadline: string | null;
  status: string;
  notes?: string | null;
  assigned_to?: string | null;
  sponsor_name?: string;
};

interface Props {
  benefit: EditableBenefit | null;
  onClose: () => void;
}

export default function EditBenefitDialog({ benefit, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    benefit_name: "",
    deadline: "",
    status: "not_started" as BenefitStatus,
    notes: "",
    assigned_to: "",
  });

  useEffect(() => {
    if (benefit) {
      setForm({
        benefit_name: benefit.benefit_name,
        deadline: benefit.deadline?.slice(0, 10) ?? "",
        status: benefit.status as BenefitStatus,
        notes: benefit.notes ?? "",
        assigned_to: benefit.assigned_to ?? "",
      });
      setError("");
    }
  }, [benefit]);

  if (!benefit) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: err } = await supabase
      .from("sponsor_benefits")
      .update({
        benefit_name: form.benefit_name,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
        status: form.status,
        notes: form.notes || null,
        assigned_to: form.assigned_to || null,
      })
      .eq("id", benefit!.id);

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    onClose();
    router.refresh();
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="font-display text-xl font-bold text-gray-900">Uredi benefit</h2>
            {benefit.sponsor_name && (
              <div className="flex items-center gap-1.5 mt-1">
                <User size={12} className="text-gray-400" />
                <span className="text-sm text-gray-500">{benefit.sponsor_name}</span>
                <span className="text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full font-medium">
                  samo ovaj sponzor
                </span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mt-0.5">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Naziv benefita *
              {benefit.sponsor_name && (
                <span className="ml-2 text-xs font-normal text-gray-400">
                  (promjena naziva vrijedi samo za {benefit.sponsor_name})
                </span>
              )}
            </label>
            <input
              type="text"
              value={form.benefit_name}
              onChange={(e) => setForm({ ...form, benefit_name: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Rok</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as BenefitStatus })}
                className="input-field"
              >
                <option value="not_started">Nije počelo</option>
                <option value="in_progress">U tijeku</option>
                <option value="completed">Završeno</option>
                <option value="overdue">Kasni</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Odgovorna osoba</label>
            <input
              type="email"
              value={form.assigned_to}
              onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
              className="input-field"
              placeholder="osoba@tvrtka.hr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Napomene</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input-field resize-none"
              rows={3}
              placeholder="Dodatne napomene..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Odustani
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <><Loader2 size={14} className="animate-spin" /> Sprema...</> : "Spremi promjene"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
