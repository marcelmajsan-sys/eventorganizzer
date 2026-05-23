"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Pencil, X, Loader2, Save } from "lucide-react";
import type { Sponsor, PackageType, LeadStatus } from "@/types";

const FALLBACK_PACKAGES: string[] = ["Glavni", "Zlatni", "Srebrni", "Brončani", "Medijski", "Community"];

export default function EditSponsorForm({ sponsor, packageTypes }: { sponsor: Sponsor; packageTypes?: string[] }) {
  const PACKAGES = packageTypes ?? FALLBACK_PACKAGES;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    name: sponsor.name,
    package_type: sponsor.package_type,
    contact_email: sponsor.contact_email,
    contact_name: sponsor.contact_name,
    contact_phone: sponsor.contact_phone ?? "",
    payment_status: sponsor.payment_status,
    lead_status: sponsor.lead_status ?? ("" as LeadStatus | ""),
    notes: sponsor.notes ?? "",
    iznos: sponsor.iznos != null ? String(sponsor.iznos) : "",
    partial_amount: sponsor.partial_amount != null ? String(sponsor.partial_amount) : "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { iznos: _iznos, partial_amount: _partial, ...rest } = form;
    const basePayload = {
      ...rest,
      lead_status: form.lead_status || null,
      contact_phone: form.contact_phone || null,
    };
    const iznosValue = form.iznos !== "" ? parseFloat(form.iznos) : null;
    const partialValue = form.payment_status === "partial" && form.partial_amount !== ""
      ? parseFloat(form.partial_amount) : null;

    let { error } = await supabase
      .from("sponsors")
      .update({ ...basePayload, iznos: iznosValue, partial_amount: partialValue })
      .eq("id", sponsor.id);

    if (error?.message?.includes("partial_amount")) {
      ({ error } = await supabase.from("sponsors").update({ ...basePayload, iznos: iznosValue }).eq("id", sponsor.id));
    }
    if (error?.message?.includes("iznos")) {
      ({ error } = await supabase.from("sponsors").update(basePayload).eq("id", sponsor.id));
    }

    setLoading(false);
    if (!error) {
      setOpen(false);
      router.refresh();
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-secondary">
        <Pencil size={14} />
        Uredi
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-enter">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-display text-xl font-bold text-gray-900">Uredi partnera</h2>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Naziv tvrtke</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategorija</label>
              <select value={form.package_type} onChange={(e) => setForm({ ...form, package_type: e.target.value as PackageType })} className="input-field">
                {PACKAGES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Plaćanje</label>
              <select value={form.payment_status} onChange={(e) => setForm({ ...form, payment_status: e.target.value as any })} className="input-field">
                <option value="pending">Na čekanju</option>
                <option value="partial">Djelomično plaćeno</option>
                <option value="paid">Plaćeno</option>
                <option value="overdue">Kasni</option>
                <option value="compensation">Kompenzacija</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select value={form.lead_status} onChange={(e) => setForm({ ...form, lead_status: e.target.value as LeadStatus | "" })} className="input-field">
                <option value="">— Nije postavljeno —</option>
                <option value="cold_lead">Cold Lead</option>
                <option value="hot_lead">Hot Lead</option>
                <option value="confirmed_new">Potvrđeno Novi</option>
                <option value="confirmed_returning">Potvrđeno Stari</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kontakt osoba</label>
              <input type="text" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Broj mobitela</label>
              <input type="tel" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className="input-field" placeholder="+385 91 000 0000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Iznos (€)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.iznos}
                onChange={(e) => setForm({ ...form, iznos: e.target.value })}
                className="input-field"
                placeholder="npr. 5000"
              />
            </div>
            {form.payment_status === "partial" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Djelomično plaćeno (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.partial_amount}
                  onChange={(e) => setForm({ ...form, partial_amount: e.target.value })}
                  className="input-field border-amber-300 focus:ring-amber-500"
                  placeholder="npr. 2500"
                />
                {form.iznos && form.partial_amount && (
                  <p className="text-xs text-gray-400 mt-1">
                    Preostalo: {(parseFloat(form.iznos || "0") - parseFloat(form.partial_amount || "0")).toLocaleString("hr-HR")} €
                  </p>
                )}
              </div>
            )}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Napomene</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field resize-none" rows={3} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1 justify-center">Odustani</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <><Loader2 size={14} className="animate-spin" /> Sprema...</> : <><Save size={14} /> Spremi</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
