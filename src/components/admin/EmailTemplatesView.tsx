"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, X, Loader2, Mail, Eye } from "lucide-react";

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  button_text: string | null;
  button_url: string | null;
  is_active: boolean;
  created_at: string;
}

const empty = {
  name: "", subject: "", body: "", button_text: "", button_url: "", is_active: true,
};

function EmailPreview({ subject, body, buttonText, buttonUrl }: {
  subject: string; body: string; buttonText: string; buttonUrl: string;
}) {
  const lines = body.split("\n").filter(Boolean);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden text-sm">
      <div className="bg-gray-800 px-4 py-2 text-xs text-gray-400">
        Predmet: <span className="text-white">{subject || "(bez predmeta)"}</span>
      </div>
      <div className="bg-white p-0">
        <div className="bg-gray-900 px-6 py-4 flex items-center gap-2">
          <Mail size={16} className="text-brand-400" />
          <span className="text-white font-display font-bold text-sm">CRO Commerce</span>
        </div>
        <div className="px-6 py-5 space-y-3">
          {lines.length > 0 ? lines.map((line, i) => (
            <p key={i} className="text-gray-700 text-sm leading-relaxed">{line}</p>
          )) : (
            <p className="text-gray-400 text-sm italic">Tijelo emaila će se prikazati ovdje...</p>
          )}
          {buttonText && (
            <div className="pt-2">
              <span className="inline-block bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                {buttonText}
              </span>
            </div>
          )}
        </div>
        <div className="bg-gray-100 px-6 py-3 text-center text-xs text-gray-500">
          CRO Commerce · Zagreb · cro-commerce.hr
        </div>
      </div>
    </div>
  );
}

interface ModalProps {
  initial?: Template | null;
  onClose: () => void;
  onSaved: () => void;
}

function TemplateModal({ initial, onClose, onSaved }: ModalProps) {
  const [form, setForm] = useState(initial ? {
    name: initial.name, subject: initial.subject, body: initial.body,
    button_text: initial.button_text ?? "", button_url: initial.button_url ?? "",
    is_active: initial.is_active,
  } : { ...empty });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.subject.trim() || !form.body.trim()) {
      setError("Naziv, predmet i tijelo su obavezni.");
      return;
    }
    setLoading(true);
    setError("");
    const payload = {
      name: form.name.trim(),
      subject: form.subject.trim(),
      body: form.body.trim(),
      button_text: form.button_text.trim() || null,
      button_url: form.button_url.trim() || null,
      is_active: form.is_active,
      updated_at: new Date().toISOString(),
    };
    const { error: err } = initial
      ? await supabase.from("email_templates").update(payload).eq("id", initial.id)
      : await supabase.from("email_templates").insert(payload);
    setLoading(false);
    if (err) { setError(err.message); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ maxHeight: "calc(100vh - 2rem)" }}>
        {/* Header — fiksan */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-display text-xl font-bold text-gray-900">
            {initial ? "Uredi predložak" : "Novi predložak"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        {/* Tabovi — fiksan */}
        <div className="flex border-b border-gray-100 flex-shrink-0">
          <button
            onClick={() => setTab("edit")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${tab === "edit" ? "border-brand-600 text-brand-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            Uređivanje
          </button>
          <button
            onClick={() => setTab("preview")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${tab === "preview" ? "border-brand-600 text-brand-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            <Eye size={14} /> Pregled
          </button>
        </div>

        {/* Scrollable sadržaj */}
        <div className="overflow-y-auto flex-1">
          {tab === "edit" ? (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Naziv predloška *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input-field" placeholder="npr. Podsjetnik 7 dana prije roka" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Predmet emaila *</label>
                <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                  className="input-field" placeholder="npr. Podsjetnik: rok benefita se bliži" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tijelo emaila *</label>
                <p className="text-xs text-gray-400 mb-1.5">
                  Dostupne varijable: <code className="bg-gray-100 px-1 rounded">{"{{benefit_name}}"}</code>{" "}
                  <code className="bg-gray-100 px-1 rounded">{"{{sponsor_name}}"}</code>{" "}
                  <code className="bg-gray-100 px-1 rounded">{"{{deadline}}"}</code>{" "}
                  <code className="bg-gray-100 px-1 rounded">{"{{days_left}}"}</code>
                </p>
                <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })}
                  className="input-field resize-none" rows={6}
                  placeholder={"Poštovani,\n\nPodsjećamo vas da benefit {{benefit_name}} za sponzora {{sponsor_name}} ima rok {{deadline}} (za {{days_left}} dana).\n\nSrdačan pozdrav,\nTim CRO Commerce"} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tekst gumba (opcija)</label>
                  <input value={form.button_text} onChange={e => setForm({ ...form, button_text: e.target.value })}
                    className="input-field" placeholder="npr. Otvori benefit" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">URL gumba (opcija)</label>
                  <input value={form.button_url} onChange={e => setForm({ ...form, button_url: e.target.value })}
                    className="input-field" placeholder="https://..." />
                </div>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.is_active}
                  onChange={e => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 accent-brand-600" />
                <span className="text-sm text-gray-700">Aktivan predložak</span>
              </label>
              {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Odustani</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
                  {loading ? <><Loader2 size={14} className="animate-spin" /> Sprema...</> : "Spremi predložak"}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6">
              <EmailPreview
                subject={form.subject}
                body={form.body}
                buttonText={form.button_text}
                buttonUrl={form.button_url}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EmailTemplatesView({ templates: initial }: { templates: Template[] }) {
  const [templates, setTemplates] = useState(initial);
  const [modal, setModal] = useState<"new" | Template | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete(t: Template) {
    if (!confirm(`Obriši predložak "${t.name}"?`)) return;
    await supabase.from("email_templates").delete().eq("id", t.id);
    router.refresh();
    setTemplates(prev => prev.filter(x => x.id !== t.id));
  }

  async function handleToggle(t: Template) {
    await supabase.from("email_templates").update({ is_active: !t.is_active }).eq("id", t.id);
    setTemplates(prev => prev.map(x => x.id === t.id ? { ...x, is_active: !x.is_active } : x));
  }

  function handleSaved() {
    setModal(null);
    router.refresh();
  }

  return (
    <div className="animate-enter">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Email predlošci</h1>
          <p className="page-subtitle">{templates.length} predložak{templates.length === 1 ? "" : templates.length < 5 ? "a" : "a"} ukupno</p>
        </div>
        <button onClick={() => setModal("new")} className="btn-primary">
          <Plus size={16} /> Novi predložak
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="card p-12 text-center">
          <Mail size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Nema predložaka. Kreiraj prvi predložak.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map(t => (
            <div key={t.id} className="card p-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail size={16} className="text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <span className={`badge text-xs ${t.is_active ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                      {t.is_active ? "Aktivan" : "Neaktivan"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">Predmet: {t.subject}</p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{t.body}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleToggle(t)}
                  className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${t.is_active ? "bg-brand-600" : "bg-gray-200"}`}
                  title={t.is_active ? "Deaktiviraj" : "Aktiviraj"}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5 ${t.is_active ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
                <button onClick={() => setModal(t)} className="btn-secondary p-2"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(t)} className="btn-secondary p-2 text-red-500 hover:bg-red-50 hover:border-red-200"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <TemplateModal
          initial={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
