"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Pencil, X, Loader2 } from "lucide-react";
import type { SponsorBenefit, BenefitStatus } from "@/types";

interface Props {
  benefit: SponsorBenefit;
}

export default function EditBenefitModal({ benefit }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    benefit_name: benefit.benefit_name,
    deadline: benefit.deadline?.slice(0, 10) ?? "",
    status: benefit.status,
    notes: benefit.notes ?? "",
    assigned_to: benefit.assigned_to ?? "",
  });

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
      .eq("id", benefit.id);

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        title="Uredi benefit"
      >
        <Pencil size={14} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-enter">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-display text-xl font-bold text-gray-900">Uredi benefit</h2>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Naziv benefita *</label>
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
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1 justify-center">
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
