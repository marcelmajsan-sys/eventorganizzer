"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Pencil, X, Loader2, Save, Trash2 } from "lucide-react";

const CONTACT_TYPES = [
  { value: "contact",          label: "Kontakt" },
  { value: "ticket",           label: "Ulaznica" },
  { value: "partner",          label: "Partner" },
  { value: "visitor",          label: "Visitor" },
  { value: "speaker",          label: "Speaker" },
  { value: "service_provider", label: "Service Provider" },
  { value: "brand_ambassador", label: "Brand Ambassador" },
];

interface Contact {
  id: string;
  sponsor_id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;
  company: string | null;
  type: string;
  notes: string | null;
}

export default function ContactDetailActions({ contact }: { contact: Contact }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: contact.name ?? "",
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    company: contact.company ?? "",
    role: contact.role ?? "",
    type: contact.type,
    notes: contact.notes ?? "",
  });
  const router = useRouter();
  const supabase = createClient();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await supabase.from("sponsor_contacts").update({
      name:    form.name    || null,
      email:   form.email   || null,
      phone:   form.phone   || null,
      company: form.company || null,
      role:    form.role    || null,
      type:    form.type,
      notes:   form.notes   || null,
    }).eq("id", contact.id);
    setLoading(false);
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Obriši kontakt "${contact.name}"?`)) return;
    await supabase.from("sponsor_contacts").delete().eq("id", contact.id);
    router.push("/admin/contacts");
  }

  if (!editing) {
    return (
      <div className="flex gap-2">
        <button onClick={() => setEditing(true)} className="btn-secondary">
          <Pencil size={14} />
          Uredi
        </button>
        <button onClick={handleDelete} className="btn-secondary text-red-600 hover:bg-red-50 hover:border-red-200">
          <Trash2 size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-enter">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-display text-xl font-bold text-gray-900">Uredi kontakt</h2>
          <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ime i prezime</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ime firme</label>
            <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefon</label>
            <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Funkcija</label>
            <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tip</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
              {CONTACT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Napomena</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field resize-none" rows={3} placeholder="Interne napomene o kontaktu..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setEditing(false)} className="btn-secondary flex-1 justify-center">Odustani</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <><Loader2 size={14} className="animate-spin" /> Sprema...</> : <><Save size={14} /> Spremi</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
