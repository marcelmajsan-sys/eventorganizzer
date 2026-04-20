"use client";

import { useState } from "react";
import { Handshake, Plus, Trash2, Loader2, Eye, EyeOff, X, Building2 } from "lucide-react";
import { createPartnerUser, deletePartnerUser } from "@/app/actions/partnerManagement";
import type { PartnerUser } from "@/app/actions/partnerManagement";

interface Sponsor {
  id: string;
  name: string;
}

interface Props {
  partners: PartnerUser[];
  sponsors: Sponsor[];
}

export default function PartnerManagementSection({ partners: initial, sponsors }: Props) {
  const [partners, setPartners] = useState(initial);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", sponsor_id: "" });

  function flash(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.sponsor_id) { setError("Odaberi sponzora."); return; }
    setLoading(true);
    setError(null);
    try {
      await createPartnerUser(form.email, form.password, form.sponsor_id, form.name);
      const sponsor = sponsors.find((s) => s.id === form.sponsor_id);
      setPartners((prev) => [...prev, {
        id: "new",
        user_id: "",
        sponsor_id: form.sponsor_id,
        sponsor_name: sponsor?.name ?? "—",
        email: form.email.toLowerCase(),
        name: form.name || null,
      }]);
      setForm({ name: "", email: "", password: "", sponsor_id: "" });
      setShowAdd(false);
      flash("Partner kreiran.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(partner: PartnerUser) {
    if (!confirm(`Obriši partnera ${partner.email}?`)) return;
    setDeletingId(partner.id);
    try {
      await deletePartnerUser(partner.id, partner.user_id, partner.projectId);
      setPartners((prev) => prev.filter((p) => p.id !== partner.id));
      flash("Partner obrisan.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Handshake size={16} className="text-gray-400" />
            Partneri
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Korisnici s pristupom sponzorskom portalu. Vide samo podatke svog sponzora.
          </p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setError(null); }}
          className="btn-primary text-sm"
        >
          <Plus size={14} /> Novi partner
        </button>
      </div>

      {success && (
        <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Ime i prezime</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field text-sm py-1.5"
                placeholder="Marko Horvat"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field text-sm py-1.5"
                placeholder="marko@tvrtka.hr"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Lozinka *</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field text-sm py-1.5 pr-8"
                  placeholder="Min. 6 znakova"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Sponzor *</label>
              <select
                required
                value={form.sponsor_id}
                onChange={(e) => setForm({ ...form, sponsor_id: e.target.value })}
                className="input-field text-sm py-1.5"
              >
                <option value="">Odaberi sponzora...</option>
                {sponsors.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => { setShowAdd(false); setError(null); }} className="btn-secondary text-sm">
              <X size={13} /> Odustani
            </button>
            <button type="submit" disabled={loading} className="btn-primary text-sm">
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              Kreiraj
            </button>
          </div>
        </form>
      )}

      {/* Partner list */}
      <div className="divide-y divide-gray-100">
        {partners.length === 0 && !showAdd && (
          <p className="text-xs text-gray-400 py-4 text-center">Nema kreiranih partnera</p>
        )}
        {partners.map((partner) => (
          <div key={partner.id} className="flex items-center gap-3 py-3 group">
            <div className="w-7 h-7 bg-brand-50 rounded-full flex items-center justify-center flex-shrink-0">
              <Building2 size={12} className="text-brand-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {partner.name && <p className="text-sm font-medium text-gray-900">{partner.name}</p>}
                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{partner.sponsor_name}</span>
              </div>
              <p className="text-xs text-brand-600">{partner.email}</p>
            </div>
            <button
              onClick={() => handleDelete(partner)}
              disabled={deletingId === partner.id}
              className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              {deletingId === partner.id
                ? <Loader2 size={14} className="animate-spin" />
                : <Trash2 size={14} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
