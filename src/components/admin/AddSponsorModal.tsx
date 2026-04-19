"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, X, Loader2 } from "lucide-react";
import { PACKAGE_BENEFITS } from "@/lib/utils";
import type { PackageType } from "@/types";

const PACKAGES: PackageType[] = ["Glavni", "Zlatni", "Srebrni", "Brončani"];

export default function AddSponsorModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    name: "",
    package_type: "Zlatni" as PackageType,
    contact_email: "",
    contact_name: "",
    payment_status: "pending",
    notes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Insert sponsor
      const { data: sponsor, error: sponsorError } = await supabase
        .from("sponsors")
        .insert(form)
        .select()
        .single();

      if (sponsorError) throw sponsorError;

      // Auto-create benefits for the package
      const benefits = PACKAGE_BENEFITS[form.package_type];
      const conferenceDate = new Date("2026-06-10");

      const benefitsToInsert = benefits.map((benefit, i) => {
        const deadline = new Date(conferenceDate);
        deadline.setMonth(deadline.getMonth() - (3 - i));
        return {
          sponsor_id: sponsor.id,
          benefit_name: benefit,
          deadline: deadline.toISOString(),
          status: "not_started",
        };
      });

      await supabase.from("sponsor_benefits").insert(benefitsToInsert);

      setOpen(false);
      setForm({ name: "", package_type: "Zlatni", contact_email: "", contact_name: "", payment_status: "pending", notes: "" });
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Greška pri dodavanju sponzora");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary">
        <Plus size={16} />
        Dodaj sponzora
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-enter">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-display text-xl font-bold text-gray-900">Novi sponzor</h2>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Naziv tvrtke *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                placeholder="npr. Monri Payments"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Paket *</label>
              <select
                value={form.package_type}
                onChange={(e) => setForm({ ...form, package_type: e.target.value as PackageType })}
                className="input-field"
              >
                {PACKAGES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status plaćanja</label>
              <select
                value={form.payment_status}
                onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
                className="input-field"
              >
                <option value="pending">Na čekanju</option>
                <option value="paid">Plaćeno</option>
                <option value="overdue">Kasni</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kontakt osoba *</label>
              <input
                type="text"
                value={form.contact_name}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                className="input-field"
                placeholder="Ime i prezime"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
              <input
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                className="input-field"
                placeholder="email@tvrtka.hr"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Napomene</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="input-field resize-none"
                rows={3}
                placeholder="Interne napomene..."
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1 justify-center">
              Odustani
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <><Loader2 size={14} className="animate-spin" /> Dodaje se...</> : "Dodaj sponzora"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
