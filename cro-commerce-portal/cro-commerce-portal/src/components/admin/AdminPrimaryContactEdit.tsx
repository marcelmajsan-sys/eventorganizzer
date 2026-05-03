"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X, Loader2, User, Mail, Phone } from "lucide-react";
import { updatePrimaryContact } from "@/app/actions/partnerManagement";

interface Props {
  sponsorId: string;
  initial: { name: string | null; email: string | null; phone: string | null };
}

export default function AdminPrimaryContactEdit({ sponsorId, initial }: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: initial.name ?? "",
    email: initial.email ?? "",
    phone: initial.phone ?? "",
  });
  const [displayed, setDisplayed] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setDisplayed(initial);
    setForm({ name: initial.name ?? "", email: initial.email ?? "", phone: initial.phone ?? "" });
  }, [initial.name, initial.email, initial.phone]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const { error: err } = await updatePrimaryContact(sponsorId, {
      contact_name: form.name || null,
      contact_email: form.email || null,
      contact_phone: form.phone || null,
    });
    setSaving(false);
    if (err) { setError(err); return; }
    setDisplayed({ name: form.name || null, email: form.email || null, phone: form.phone || null });
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Primarni kontakt</p>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Ime i prezime</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field text-sm py-1.5"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field text-sm py-1.5"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Mobitel</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-field text-sm py-1.5"
              placeholder="+385 91 ..."
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => { setEditing(false); setError(null); }}
              className="btn-secondary text-xs py-1 px-2 flex items-center gap-1"
            >
              <X size={12} /> Odustani
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary text-xs py-1 px-2 flex items-center gap-1"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              Spremi
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasData = displayed.name || displayed.email || displayed.phone;

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 group">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Primarni kontakt</p>
        <button
          onClick={() => setEditing(true)}
          className="p-1 text-gray-300 hover:text-brand-600 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Pencil size={12} />
        </button>
      </div>
      {hasData ? (
        <div className="space-y-1.5">
          {displayed.name && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <User size={13} className="text-gray-400 flex-shrink-0" />
              {displayed.name}
            </div>
          )}
          {displayed.email && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Mail size={13} className="text-gray-400 flex-shrink-0" />
              <a href={`mailto:${displayed.email}`} className="text-brand-600 hover:underline truncate">
                {displayed.email}
              </a>
            </div>
          )}
          {displayed.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Phone size={13} className="text-gray-400 flex-shrink-0" />
              {displayed.phone}
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-gray-400 hover:text-brand-600 transition-colors"
        >
          + Dodaj primarni kontakt
        </button>
      )}
    </div>
  );
}
