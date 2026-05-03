"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, X, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  sponsorId: string;
  sponsorName: string;
}

export default function DeleteSponsorButton({ sponsorId, sponsorName }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    const { error: err } = await supabase.from("sponsors").delete().eq("id", sponsorId);
    if (err) {
      setError(err.message);
      setDeleting(false);
      return;
    }
    router.push("/admin/sponsors");
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
      >
        <Trash2 size={14} />
        Obriši sponzora
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 pt-8">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-enter">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" />
                Obriši sponzora
              </h2>
              <button onClick={() => setShowConfirm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm text-gray-700">
                Jesi li siguran da želiš obrisati sponzora <span className="font-semibold">{sponsorName}</span>?
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Ova akcija je nepovratna. Briše se i sve povezano (benefiti, kontakti, datoteke).
              </p>
              {error && (
                <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
                className="btn-secondary text-sm"
              >
                Odustani
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {deleting ? "Brisanje..." : "Obriši"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
