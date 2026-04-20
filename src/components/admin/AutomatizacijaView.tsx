"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, X, Loader2, Zap } from "lucide-react";

interface Template { id: string; name: string; }
interface Automation {
  id: string;
  name: string;
  trigger_type: string;
  days_before: number;
  template_id: string | null;
  custom_subject: string | null;
  is_active: boolean;
  created_at: string;
  email_templates?: { name: string } | null;
}

const PRESETS = [
  { label: "Podsjetnik 30 dana prije roka", days: 30 },
  { label: "Podsjetnik 14 dana prije roka", days: 14 },
  { label: "Podsjetnik 7 dana prije roka",  days: 7 },
  { label: "Podsjetnik 3 dana prije roka",  days: 3 },
];

const emptyForm = { name: "", days_before: 7, template_id: "", custom_subject: "" };

interface ModalProps {
  initial?: Automation | null;
  templates: Template[];
  onClose: () => void;
  onSaved: () => void;
}

function AutomationModal({ initial, templates, onClose, onSaved }: ModalProps) {
  const [form, setForm] = useState(initial ? {
    name: initial.name,
    days_before: initial.days_before,
    template_id: initial.template_id ?? "",
    custom_subject: initial.custom_subject ?? "",
  } : { ...emptyForm });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Naziv je obavezan."); return; }
    setLoading(true);
    setError("");
    const payload = {
      name: form.name.trim(),
      trigger_type: "benefit_deadline",
      days_before: Number(form.days_before),
      template_id: form.template_id || null,
      custom_subject: form.custom_subject.trim() || null,
    };
    const { error: err } = initial
      ? await supabase.from("email_automations").update(payload).eq("id", initial.id)
      : await supabase.from("email_automations").insert({ ...payload, is_active: false });
    setLoading(false);
    if (err) { setError(err.message); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-enter">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-display text-xl font-bold text-gray-900">
            {initial ? "Uredi automatizaciju" : "Nova automatizacija"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        {!initial && (
          <div className="px-6 pt-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Predlošci za brzo dodavanje</p>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map(p => (
                <button key={p.days} type="button"
                  onClick={() => setForm(f => ({ ...f, name: p.label, days_before: p.days }))}
                  className="text-left px-3 py-2 rounded-lg border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-colors text-sm"
                >
                  <p className="font-medium text-gray-800 text-xs">{p.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Naziv *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="input-field" placeholder="npr. Podsjetnik 7 dana prije roka" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Okidač</label>
              <input className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
                value="Rok benefita" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Dana prije roka</label>
              <input type="number" min={1} max={365} value={form.days_before}
                onChange={e => setForm({ ...form, days_before: Number(e.target.value) })}
                className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email predložak</label>
            <select value={form.template_id} onChange={e => setForm({ ...form, template_id: e.target.value })}
              className="input-field">
              <option value="">— odaberi predložak —</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Naslov emaila (opcija)</label>
            <input value={form.custom_subject} onChange={e => setForm({ ...form, custom_subject: e.target.value })}
              className="input-field" placeholder="Ako prazno, koristi se predmet iz predloška" />
          </div>
          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Odustani</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <><Loader2 size={14} className="animate-spin" /> Sprema...</> : initial ? "Spremi" : "Kreiraj"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AutomatizacijaView({ automations: initial, templates }: {
  automations: Automation[]; templates: Template[];
}) {
  const [automations, setAutomations] = useState(initial);
  const [modal, setModal] = useState<"new" | Automation | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleToggle(a: Automation) {
    await supabase.from("email_automations").update({ is_active: !a.is_active }).eq("id", a.id);
    setAutomations(prev => prev.map(x => x.id === a.id ? { ...x, is_active: !x.is_active } : x));
  }

  async function handleDelete(a: Automation) {
    if (!confirm(`Obriši automatizaciju "${a.name}"?`)) return;
    await supabase.from("email_automations").delete().eq("id", a.id);
    setAutomations(prev => prev.filter(x => x.id !== a.id));
  }

  function handleSaved() {
    setModal(null);
    router.refresh();
  }

  const activeCount = automations.filter(a => a.is_active).length;

  return (
    <div className="animate-enter">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Automatizacija</h1>
          <p className="page-subtitle">{activeCount} aktivna automatizacija</p>
        </div>
        <button onClick={() => setModal("new")} className="btn-primary">
          <Plus size={16} /> Nova automatizacija
        </button>
      </div>

      {automations.length === 0 ? (
        <div className="card p-12 text-center">
          <Zap size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Nema automatizacija. Kreiraj prvu.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {automations.map(a => (
            <div key={a.id} className="card p-5 flex items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${a.is_active ? "bg-brand-50" : "bg-gray-100"}`}>
                  <Zap size={16} className={a.is_active ? "text-brand-600" : "text-gray-400"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">{a.name}</p>
                    <span className={`badge text-xs ${a.is_active ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                      {a.is_active ? "Aktivna" : "Pauzirana"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Okidač: rok benefita · <span className="font-medium">{a.days_before} dana prije</span>
                    {a.email_templates?.name && <> · Predložak: <span className="font-medium">{a.email_templates.name}</span></>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleToggle(a)}
                  className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${a.is_active ? "bg-brand-600" : "bg-gray-200"}`}
                  title={a.is_active ? "Pauziraj" : "Aktiviraj"}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5 ${a.is_active ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
                <button onClick={() => setModal(a)} className="btn-secondary p-2"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(a)} className="btn-secondary p-2 text-red-500 hover:bg-red-50 hover:border-red-200"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <AutomationModal
          initial={modal === "new" ? null : modal}
          templates={templates}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
