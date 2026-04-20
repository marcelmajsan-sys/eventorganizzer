"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Pencil, X, Loader2, Send, CheckCircle } from "lucide-react";
import type { SponsorBenefit, BenefitStatus } from "@/types";

interface Template { id: string; name: string; }

interface Props {
  benefit: SponsorBenefit & { reminder_email?: string | null };
  templates?: Template[];
}

export default function EditBenefitModal({ benefit, templates = [] }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [sendError, setSendError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    benefit_name: benefit.benefit_name,
    deadline: benefit.deadline?.slice(0, 10) ?? "",
    status: benefit.status,
    notes: benefit.notes ?? "",
    assigned_to: benefit.assigned_to ?? "",
    reminder_email: benefit.reminder_email ?? "",
    reminder_template_id: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: err } = await supabase
      .from("sponsor_benefits")
      .update({
        benefit_name: form.benefit_name,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
        status: form.status,
        notes: form.notes || null,
        assigned_to: form.assigned_to || null,
        reminder_email: form.reminder_email || null,
      })
      .eq("id", benefit.id);

    if (err) { setError(err.message); setLoading(false); return; }
    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  async function handleSendReminder() {
    const to = form.reminder_email || form.assigned_to;
    if (!to) { setSendError("Unesi email primatelja ili odgovornu osobu."); return; }
    setSending(true);
    setSendError("");
    const res = await fetch(`/api/benefits/${benefit.id}/remind`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template_id: form.reminder_template_id || null,
        recipient_email: form.reminder_email || null,
      }),
    });
    const data = await res.json();
    setSending(false);
    if (!res.ok) { setSendError(data.error ?? "Greška pri slanju."); return; }
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        title="Uredi benefit"
      >
        <Pencil size={14} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-enter">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-display text-xl font-bold text-gray-900">Uredi benefit</h2>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Naziv benefita *</label>
            <input type="text" value={form.benefit_name}
              onChange={e => setForm({ ...form, benefit_name: e.target.value })}
              className="input-field" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Rok</label>
              <input type="date" value={form.deadline}
                onChange={e => setForm({ ...form, deadline: e.target.value })}
                className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as BenefitStatus })}
                className="input-field">
                <option value="not_started">Nije počelo</option>
                <option value="in_progress">U tijeku</option>
                <option value="completed">Završeno</option>
                <option value="overdue">Kasni</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Odgovorna osoba</label>
            <input type="email" value={form.assigned_to}
              onChange={e => setForm({ ...form, assigned_to: e.target.value })}
              className="input-field" placeholder="osoba@tvrtka.hr" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Napomene</label>
            <textarea value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="input-field resize-none" rows={2} placeholder="Dodatne napomene..." />
          </div>

          {/* Podsjetnik sekcija */}
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pošalji podsjetnik</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email primatelja</label>
              <input type="email" value={form.reminder_email}
                onChange={e => setForm({ ...form, reminder_email: e.target.value })}
                className="input-field" placeholder={form.assigned_to || "primatelj@tvrtka.hr"} />
              {!form.reminder_email && form.assigned_to && (
                <p className="text-xs text-gray-400 mt-1">Koristit će se: {form.assigned_to}</p>
              )}
            </div>

            {templates.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Predložak (opcija)</label>
                <select value={form.reminder_template_id}
                  onChange={e => setForm({ ...form, reminder_template_id: e.target.value })}
                  className="input-field">
                  <option value="">— zadani podsjetnik —</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            )}

            {sendError && <p className="text-xs text-red-600">{sendError}</p>}

            <button type="button" onClick={handleSendReminder} disabled={sending || sent}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                sent
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-brand-50 border-brand-200 text-brand-700 hover:bg-brand-100"
              }`}>
              {sending ? <><Loader2 size={14} className="animate-spin" /> Šalje se...</>
                : sent ? <><CheckCircle size={14} /> Poslano!</>
                : <><Send size={14} /> Pošalji podsjetnik</>}
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1 justify-center">
              Odustani
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <><Loader2 size={14} className="animate-spin" /> Sprema...</> : "Spremi promjene"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
