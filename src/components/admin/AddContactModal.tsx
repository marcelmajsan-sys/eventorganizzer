"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, X, Loader2 } from "lucide-react";

const CONTACT_TYPES = [
  { value: "partner",           label: "Partner" },
  { value: "visitor",           label: "Visitor" },
  { value: "speaker",           label: "Speaker" },
  { value: "service_provider",  label: "Service Provider" },
  { value: "brand_ambassador",  label: "Brand Ambassador" },
];

const empty = {
  name: "", email: "", phone: "", company: "", role: "", notes: "",
  type: "partner",
};

export default function AddContactModal() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  function f(key: keyof typeof empty) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: err } = await supabase.from("sponsor_contacts").insert({
      name:       form.name     || null,
      email:      form.email    || null,
      phone:      form.phone    || null,
      company:    form.company  || null,
      role:       form.role     || null,
      notes:      form.notes    || null,
      type:       form.type,
      sponsor_id: null,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setForm(empty);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary">
        <Plus size={16} />
        Dodaj kontakt
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-enter">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-display text-xl font-bold text-gray-900">Novi kontakt</h2>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tip kontakta</label>
            <div className="flex flex-wrap gap-2">
              {CONTACT_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, type: t.value }))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    form.type === t.value
                      ? "bg-brand-600 text-white border-brand-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-brand-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ime i prezime</label>
              <input type="text" value={form.name} onChange={f("name")} className="input-field" placeholder="Ime Prezime" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ime firme</label>
              <input type="text" value={form.company} onChange={f("company")} className="input-field" placeholder="npr. Monri d.o.o." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={f("email")} className="input-field" placeholder="email@firma.hr" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Broj telefona</label>
              <input type="text" value={form.phone} onChange={f("phone")} className="input-field" placeholder="+385 91 000 0000" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Funkcija</label>
              <input type="text" value={form.role} onChange={f("role")} className="input-field" placeholder="npr. Marketing Manager" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Napomena</label>
              <textarea value={form.notes} onChange={f("notes")} className="input-field resize-none" rows={3} placeholder="Interne napomene..." />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1 justify-center">Odustani</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <><Loader2 size={14} className="animate-spin" /> Dodaje se...</> : "Dodaj kontakt"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
