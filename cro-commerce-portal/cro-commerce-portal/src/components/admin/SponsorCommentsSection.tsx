"use client";

import { useState } from "react";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { addSponsorComment, type SponsorComment } from "@/app/actions/sponsorComments";

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

  async function handleAdd() {
    if (!newComment.trim()) return;
    setLoading(true);
    const { data, error } = await addSponsorComment(sponsorId, newComment.trim());
    if (!error && data) {
      setComments([data, ...comments]);
      setNewComment("");
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
      <p className="text-xs text-gray-400 mt-1">Ctrl+Enter za slanje</p>
    </div>
  );
}
