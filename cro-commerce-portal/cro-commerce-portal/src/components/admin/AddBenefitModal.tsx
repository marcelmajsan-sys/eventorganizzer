"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, X, Loader2, ChevronDown } from "lucide-react";
import type { BenefitStatus } from "@/types";

const CATEGORIES = ["Glavni", "Zlatni", "Srebrni", "Brončani", "Medijski", "Community", "EXPO", "Party", "Drinks"];

interface SponsorOption {
  id: string;
  name: string;
  package_type: string;
}

interface Props {
  sponsorId?: string;
  sponsors?: SponsorOption[];
}

function MultiSelect({
  options,
  selected,
  onChange,
  placeholder,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);

  function toggle(value: string) {
    onChange(
      selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="input-field w-full text-left flex items-center justify-between"
      >
        <span className={selected.length === 0 ? "text-gray-400" : "text-gray-900"}>
          {selected.length === 0 ? placeholder : `${selected.length} odabrano`}
        </span>
        <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
            {options.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt.value)}
                  onChange={() => toggle(opt.value)}
                  className="rounded border-gray-300 text-brand-600"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function AddBenefitModal({ sponsorId, sponsors }: Props) {
  const [open, setOpen] = useState(false);
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
  const [selectedSponsors, setSelectedSponsors] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  function handleClose() {
    setOpen(false);
    setError("");
    setForm({ benefit_name: "", deadline: "", status: "not_started", notes: "", assigned_to: "" });
    setSelectedSponsors([]);
    setSelectedCategories([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Build the list of sponsor IDs to add the benefit to
    let sponsorIds: string[] = [];

    if (sponsorId) {
      // Fixed sponsor (from sponsor detail page)
      sponsorIds = [sponsorId];
    } else {
      const fromCategories =
        sponsors
          ?.filter((s) => selectedCategories.includes(s.package_type))
          .map((s) => s.id) ?? [];
      sponsorIds = Array.from(new Set([...selectedSponsors, ...fromCategories]));
    }

    const base = {
      benefit_name: form.benefit_name,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      status: form.status,
      notes: form.notes || null,
      assigned_to: form.assigned_to || null,
    };

    const rows =
      sponsorIds.length > 0
        ? sponsorIds.map((sid) => ({ ...base, sponsor_id: sid }))
        : [{ ...base, sponsor_id: null }];

    const { error: err } = await supabase.from("sponsor_benefits").insert(rows);

    if (err) { setError(err.message); setLoading(false); return; }

    setLoading(false);
    handleClose();
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary">
        <Plus size={15} />
        Dodaj benefit
      </button>
    );
  }

  const sponsorOptions = sponsors?.map((s) => ({ value: s.id, label: s.name })) ?? [];
  const categoryOptions = CATEGORIES.map((c) => ({ value: c, label: c }));

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Naziv benefita *</label>
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

          {/* Sponsor + category selectors — only on benefits page */}
          {!sponsorId && sponsors && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Sponzori <span className="text-gray-400 font-normal">(opcionalno)</span>
                </label>
                <MultiSelect
                  options={sponsorOptions}
                  selected={selectedSponsors}
                  onChange={setSelectedSponsors}
                  placeholder="Odaberi sponzore..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Kategorija sponzorstva <span className="text-gray-400 font-normal">(opcionalno)</span>
                </label>
                <MultiSelect
                  options={categoryOptions}
                  selected={selectedCategories}
                  onChange={setSelectedCategories}
                  placeholder="Odaberi kategorije..."
                />
                {selectedCategories.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {sponsors.filter((s) => selectedCategories.includes(s.package_type)).length} sponzora iz odabranih kategorija
                  </p>
                )}
              </div>
            </>
          )}

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
