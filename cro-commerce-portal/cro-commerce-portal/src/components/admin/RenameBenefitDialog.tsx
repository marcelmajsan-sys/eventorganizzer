"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { X, Loader2, Save } from "lucide-react";

interface Props {
  currentName: string | null;
  currentDeadline?: string | null;
  onClose: () => void;
}

export default function RenameBenefitDialog({ currentName, currentDeadline, onClose }: Props) {
  const [name, setName] = useState(currentName ?? "");
  const [deadline, setDeadline] = useState(currentDeadline ?? "");

  useEffect(() => { if (currentName) setName(currentName); }, [currentName]);
  useEffect(() => { setDeadline(currentDeadline ?? ""); }, [currentDeadline]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  if (!currentName) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nameChanged = name.trim() !== currentName;
    const deadlineChanged = (deadline || null) !== (currentDeadline || null);
    if (!nameChanged && !deadlineChanged) { onClose(); return; }

    setLoading(true);
    setError("");

    const updates: Record<string, string | null> = {};
    if (nameChanged) updates.benefit_name = name.trim();
    if (deadlineChanged) updates.deadline = deadline || null;

    const { error: err } = await supabase
      .from("sponsor_benefits")
      .update(updates)
      .eq("benefit_name", currentName!);

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    onClose();
    router.refresh();
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-8"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="font-display text-lg font-bold text-gray-900">Uredi benefit</h2>
            <p className="text-xs text-gray-400 mt-0.5">Mijenja se za sve sponzore</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Naziv benefita *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Rok (za sve sponzore)</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="input-field"
            />
            {deadline && (
              <button
                type="button"
                onClick={() => setDeadline("")}
                className="text-xs text-gray-400 hover:text-red-500 mt-1"
              >
                Ukloni rok
              </button>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Odustani
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Sprema...</>
                : <><Save size={14} /> Spremi svugdje</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
