"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, X, Loader2 } from "lucide-react";
import type { BenefitStatus } from "@/types";

interface Sponsor {
  id: any;
  name: any;
  package_type: any;
}

interface Props {
  sponsorId?: string;
  sponsors?: Sponsor[];
}

export default function AddBenefitModal({ sponsorId, sponsors }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [existingNames, setExistingNames] = useState<string[]>([]);
  const [isNewBenefit, setIsNewBenefit] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    benefit_name: "",
    deadline: "",
    status: "not_started" as BenefitStatus,
    notes: "",
    assigned_to: "",
    selected_sponsor_id: sponsorId ?? "",
  });

  useEffect(() => {
    if (!open) return;
    supabase
      .from("sponsor_benefits")
      .select("benefit_name")
      .then(({ data }) => {
        const seen = new Set<string>();
        const names: string[] = [];
        (data ?? []).forEach((b) => { if (!seen.has(b.benefit_name)) { seen.add(b.benefit_name); names.push(b.benefit_name); } });
        names.sort();
        setExistingNames(names);
      });
  }, [open]);

  function handleClose() {
    setOpen(false);
    setError("");
    setIsNewBenefit(false);
    setForm({ benefit_name: "", deadline: "", status: "not_started", notes: "", assigned_to: "", selected_sponsor_id: sponsorId ?? "" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: err } = await supabase.from("sponsor_benefits").insert({
      sponsor_id: form.selected_sponsor_id || null,
      benefit_name: form.benefit_name,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      status: form.status,
      notes: form.notes || null,
      assigned_to: form.assigned_to || null,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    handleClose();
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => {
          document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" });
          setOpen(true);
        }}
        className="btn-primary"
      >
        <Plus size={15} />
        Dodaj benefit
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-8"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-display text-xl font-bold text-gray-900">Dodaj benefit</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          {sponsors && sponsors.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Partner</label>
              <select
                value={form.selected_sponsor_id}
                onChange={(e) => setForm({ ...form, selected_sponsor_id: e.target.value })}
                className="input-field"
              >
                <option value="">— bez partnera —</option>
                {sponsors.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Naziv benefita *</label>
            {existingNames.length > 0 && !isNewBenefit ? (
              <select
                value={form.benefit_name}
                onChange={(e) => {
                  if (e.target.value === "__new__") {
                    setIsNewBenefit(true);
                    setForm({ ...form, benefit_name: "" });
                  } else {
                    setForm({ ...form, benefit_name: e.target.value });
                  }
                }}
                className="input-field"
                required
                autoFocus
              >
                <option value="">— odaberi benefit —</option>
                {existingNames.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
                <option value="__new__">+ Dodaj novi benefit</option>
              </select>
            ) : (
              <div>
                {existingNames.length > 0 && (
                  <button
                    type="button"
                    onClick={() => { setIsNewBenefit(false); setForm({ ...form, benefit_name: "" }); }}
                    className="text-xs text-brand-600 hover:underline mb-1.5 block"
                  >
                    ← Odaberi postojeći benefit
                  </button>
                )}
                <input
                  type="text"
                  value={form.benefit_name}
                  onChange={(e) => setForm({ ...form, benefit_name: e.target.value })}
                  className="input-field"
                  placeholder="npr. Oglas u magazinu"
                  autoFocus
                  required
                />
              </div>
            )}
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
              type="text"
              value={form.assigned_to}
              onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
              className="input-field"
              placeholder="Ime i prezime"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Napomene</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input-field resize-none"
              rows={2}
              placeholder="Dodatne napomene..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleClose} className="btn-secondary flex-1 justify-center">
              Odustani
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <><Loader2 size={14} className="animate-spin" /> Dodaje...</> : "Dodaj benefit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
