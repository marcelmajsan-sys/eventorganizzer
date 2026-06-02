"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Pencil, X, Loader2, Save, MessageSquare, Send, Trash2, Check } from "lucide-react";
import type { Sponsor, PackageType, LeadStatus } from "@/types";
import { getSponsorComments, addSponsorComment, updateSponsorComment, deleteSponsorComment, createCommentReminder, type SponsorComment } from "@/app/actions/sponsorComments";

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

  const [comments, setComments] = useState<SponsorComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [followUpEnabled, setFollowUpEnabled] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");

  useEffect(() => {
    if (!open) return;
    setCommentsLoading(true);
    getSponsorComments(sponsor.id).then(({ data }) => {
      setComments(data ?? []);
      setCommentsLoading(false);
    });
  }, [open, sponsor.id]);

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

  async function handleAddComment() {
    if (!newComment.trim()) return;
    setCommentLoading(true);
    const text = newComment.trim();
    const { data, error } = await addSponsorComment(sponsor.id, text);
    if (!error && data) {
      if (followUpEnabled && followUpDate) {
        await createCommentReminder(data.id, sponsor.id, text, followUpDate);
      }
      setComments([data, ...comments]);
      setNewComment("");
      setFollowUpEnabled(false);
      setFollowUpDate("");
    }
    setCommentLoading(false);
  }

  async function handleUpdateComment(id: string) {
    if (!editingText.trim()) return;
    setCommentLoading(true);
    const { error } = await updateSponsorComment(id, editingText.trim());
    if (!error) {
      setComments(comments.map((c) => c.id === id ? { ...c, comment: editingText.trim() } : c));
      setEditingId(null);
    }
    setCommentLoading(false);
  }

  async function handleDeleteComment(id: string) {
    setDeletingId(id);
    const { error } = await deleteSponsorComment(id);
    if (!error) {
      setComments(comments.filter((c) => c.id !== id));
    }
    setDeletingId(null);
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-enter max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-display text-xl font-bold text-gray-900">Uredi partnera</h2>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
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

          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={15} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Komentari</span>
            </div>

            {commentsLoading ? (
              <div className="flex justify-center py-3">
                <Loader2 size={16} className="animate-spin text-gray-400" />
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-2 mb-3 max-h-44 overflow-y-auto pr-1">
                {comments.map((c) => (
                  <div key={c.id} className="bg-gray-50 rounded-lg p-3 text-sm group">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                      <span>
                        {new Date(c.created_at).toLocaleDateString("hr-HR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-gray-500">{c.admin_email.split("@")[0]}</span>
                      {c.remind_at && (
                        <span className="flex items-center gap-0.5 text-amber-600 font-medium">
                          <span>•</span>
                          <span>&#128197; {new Date(c.remind_at).toLocaleDateString("hr-HR", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
                        </span>
                      )}
                      <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => { setEditingId(c.id); setEditingText(c.comment); }}
                          className="p-0.5 text-gray-400 hover:text-gray-700"
                        >
                          <Pencil size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(c.id)}
                          disabled={deletingId === c.id}
                          className="p-0.5 text-gray-400 hover:text-red-500"
                        >
                          {deletingId === c.id ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                        </button>
                      </div>
                    </div>
                    {editingId === c.id ? (
                      <div className="flex gap-1.5 items-end mt-1">
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="input-field resize-none flex-1 text-sm"
                          rows={2}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleUpdateComment(c.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateComment(c.id)}
                            disabled={commentLoading}
                            className="p-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                          >
                            {commentLoading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700 leading-snug whitespace-pre-wrap">{c.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 mb-3">Nema komentara.</p>
            )}

            <div className="flex gap-2 items-end">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="input-field resize-none flex-1 text-sm"
                rows={2}
                placeholder="Dodaj komentar..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAddComment();
                }}
              />
              <button
                type="button"
                onClick={handleAddComment}
                disabled={commentLoading || !newComment.trim()}
                className="btn-primary px-3 py-2"
              >
                {commentLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="followup-toggle"
                checked={followUpEnabled}
                onChange={(e) => setFollowUpEnabled(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-gray-300 accent-orange-500 cursor-pointer"
              />
              <label htmlFor="followup-toggle" className="text-xs text-gray-500 cursor-pointer select-none">
                Follow up podsjetnik
              </label>
              {followUpEnabled && (
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="input-field text-xs py-1 flex-1"
                />
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">Ctrl+Enter za slanje</p>
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
