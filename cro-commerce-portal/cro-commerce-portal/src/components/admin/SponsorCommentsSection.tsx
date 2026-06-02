"use client";

import { useState } from "react";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { addSponsorComment, createCommentReminder, type SponsorComment } from "@/app/actions/sponsorComments";

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

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare size={14} className="text-gray-400" />
        <p className="text-xs text-gray-500 font-medium">Komentari</p>
      </div>

      {comments.length > 0 && (
        <div className="space-y-2 mb-3">
          {comments.map((c) => (
            <div key={c.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1 flex-wrap">
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
              </div>
              <p className="text-sm text-gray-700 leading-snug whitespace-pre-wrap">{c.comment}</p>
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
