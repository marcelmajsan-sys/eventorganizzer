"use client";

import { useState } from "react";
import { MessageSquare, Send, Loader2, Pencil, Trash2, Check, X } from "lucide-react";
import { addSponsorComment, updateSponsorComment, deleteSponsorComment, createCommentReminder, updateCommentReminder, type SponsorComment } from "@/app/actions/sponsorComments";

export default function SponsorCommentsSection({
  sponsorId,
  initialComments,
}: {
  sponsorId: string;
  initialComments: SponsorComment[];
}) {
  const [comments, setComments] = useState<SponsorComment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [followUpEnabled, setFollowUpEnabled] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [editingReminderDate, setEditingReminderDate] = useState("");
  const [reminderLoading, setReminderLoading] = useState(false);

  async function handleAdd() {
    if (!newComment.trim()) return;
    setLoading(true);
    const text = newComment.trim();
    const { data, error } = await addSponsorComment(sponsorId, text);
    if (!error && data) {
      if (followUpEnabled && followUpDate) {
        await createCommentReminder(data.id, sponsorId, text, followUpDate);
      }
      setComments([{ ...data, remind_at: followUpEnabled && followUpDate ? followUpDate : null }, ...comments]);
      setNewComment("");
      setFollowUpEnabled(false);
      setFollowUpDate("");
    }
    setLoading(false);
  }

  async function handleUpdate(id: string) {
    if (!editingText.trim()) return;
    setEditLoading(true);
    const { error } = await updateSponsorComment(id, editingText.trim());
    if (!error) {
      setComments(comments.map((c) => c.id === id ? { ...c, comment: editingText.trim() } : c));
      setEditingId(null);
    }
    setEditLoading(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const { error } = await deleteSponsorComment(id);
    if (!error) setComments(comments.filter((c) => c.id !== id));
    setDeletingId(null);
  }

  async function handleUpdateReminder(commentId: string) {
    if (!editingReminderDate) return;
    setReminderLoading(true);
    const { error } = await updateCommentReminder(commentId, editingReminderDate);
    if (!error) {
      setComments(comments.map((c) => c.id === commentId ? { ...c, remind_at: editingReminderDate } : c));
      setEditingReminderId(null);
    }
    setReminderLoading(false);
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare size={14} className="text-gray-400" />
        <p className="text-xs text-gray-500 font-medium">Komentari</p>
      </div>

      {comments.length > 0 && (
        <div className="space-y-2 mb-3">
          {comments.map((c) => (
            <div key={c.id} className="bg-gray-50 rounded-lg p-3 group">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1 flex-wrap">
                <span>
                  {new Date(c.created_at).toLocaleDateString("hr-HR", {
                    day: "2-digit", month: "2-digit", year: "numeric",
                  })}
                </span>
                <span>•</span>
                <span className="font-medium text-gray-500">{c.admin_email.split("@")[0]}</span>
                {c.remind_at && (
                  editingReminderId === c.id ? (
                    <span className="flex items-center gap-1">
                      <span>•</span>
                      <input
                        type="date"
                        value={editingReminderDate}
                        onChange={(e) => setEditingReminderDate(e.target.value)}
                        className="border border-amber-400 rounded px-1 py-0.5 text-xs text-amber-700 bg-amber-50"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdateReminder(c.id);
                          if (e.key === "Escape") setEditingReminderId(null);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateReminder(c.id)}
                        disabled={reminderLoading}
                        className="p-0.5 text-amber-600 hover:text-amber-800"
                      >
                        {reminderLoading ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                      </button>
                      <button type="button" onClick={() => setEditingReminderId(null)} className="p-0.5 text-gray-400 hover:text-gray-600">
                        <X size={10} />
                      </button>
                    </span>
                  ) : (
                    <span
                      className="flex items-center gap-0.5 text-amber-600 font-medium cursor-pointer hover:text-amber-800 hover:underline"
                      onClick={() => { setEditingReminderId(c.id); setEditingReminderDate(c.remind_at!); }}
                      title="Klikni za izmjenu datuma"
                    >
                      <span>•</span>
                      <span>FOLLOW UP {new Date(c.remind_at).toLocaleDateString("hr-HR", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
                    </span>
                  )
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
                    onClick={() => handleDelete(c.id)}
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
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleUpdate(c.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => handleUpdate(c.id)}
                      disabled={editLoading}
                      className="p-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                      {editLoading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
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
                <p className="text-sm text-gray-700 leading-snug whitespace-pre-wrap">{c.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-end">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="input-field resize-none flex-1 text-sm"
          rows={2}
          placeholder="Dodaj komentar..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAdd();
          }}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={loading || !newComment.trim()}
          className="btn-primary px-3 py-2"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          id="followup-section-toggle"
          checked={followUpEnabled}
          onChange={(e) => setFollowUpEnabled(e.target.checked)}
          className="w-3.5 h-3.5 rounded border-gray-300 accent-orange-500 cursor-pointer"
        />
        <label htmlFor="followup-section-toggle" className="text-xs text-gray-500 cursor-pointer select-none">
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
  );
}
