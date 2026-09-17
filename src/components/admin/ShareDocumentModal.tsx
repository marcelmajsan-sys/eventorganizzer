"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Loader2, X, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatFileSize } from "@/lib/utils";
import { shareDocumentWithSponsors } from "@/app/actions/sharedDocuments";

type Scope = "clients" | "visible" | "all";

/** Naziv datoteke bezbjedan za Supabase Storage ključ (dijakritike i razmaci → `_`). */
function safeStorageName(name: string): string {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9._-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  return cleaned || "dokument";
}

/**
 * Admin: jedan upload → dokument vidljiv više partnera odjednom (tab "Dokumenti" na portalu).
 * Storage objekt ide u `sponsor-files/shared/`, a `files` redove po partneru upisuje
 * server action `shareDocumentWithSponsors`.
 */
export default function ShareDocumentModal({
  clientIds,
  visibleIds,
  allIds,
  isFiltered,
}: {
  /** Potvrđeni partneri (confirmed_new / confirmed_returning) u projektu. */
  clientIds: string[];
  /** Partneri trenutno prikazani na listi (nakon filtera). */
  visibleIds: string[];
  /** Svi partneri u projektu. */
  allIds: string[];
  isFiltered: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [scope, setScope] = useState<Scope>("clients");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ shared: number; skipped: number } | null>(null);
  const router = useRouter();

  const scopeIds: Record<Scope, string[]> = { clients: clientIds, visible: visibleIds, all: allIds };
  const targetIds = scopeIds[scope];

  function reset() {
    setFile(null);
    setScope("clients");
    setBusy(false);
    setError("");
    setDone(null);
  }

  function close() {
    if (busy) return;
    setOpen(false);
    reset();
  }

  async function handleShare(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Odaberite datoteku.");
      return;
    }
    if (targetIds.length === 0) {
      setError("Nema partnera za odabrani opseg.");
      return;
    }

    setBusy(true);
    setError("");
    setDone(null);

    const supabase = createClient();
    const path = `shared/${Date.now()}_${safeStorageName(file.name)}`;

    const { error: storageError } = await supabase.storage
      .from("sponsor-files")
      .upload(path, file, { upsert: false, contentType: file.type || undefined });
    if (storageError) {
      setError(`Storage greška: ${storageError.message}`);
      setBusy(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("sponsor-files").getPublicUrl(path);

    const result = await shareDocumentWithSponsors({
      storageUrl: urlData.publicUrl,
      filename: file.name,
      fileSize: file.size,
      mimeType: file.type || null,
      sponsorIds: targetIds,
    });

    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setDone({ shared: result.shared, skipped: result.skipped });
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="btn-secondary"
        title="Jednim uploadom podijeli dokument (npr. tlocrt) s više partnera odjednom"
      >
        <FileUp size={15} /> Podijeli dokument
      </button>
    );
  }

  const scopeOptions: { value: Scope; label: string; count: number; hidden?: boolean }[] = [
    { value: "clients", label: "Svi potvrđeni partneri (klijenti)", count: clientIds.length },
    { value: "visible", label: "Trenutno filtrirani partneri", count: visibleIds.length, hidden: !isFiltered },
    { value: "all", label: "Svi partneri (uključujući leadove)", count: allIds.length },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-enter">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="font-display text-xl font-bold text-gray-900">Podijeli dokument</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Partneri ga vide na portalu u tabu &quot;Dokumenti&quot;.
            </p>
          </div>
          <button onClick={close} className="text-gray-400 hover:text-gray-600" disabled={busy}>
            <X size={20} />
          </button>
        </div>

        {done ? (
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium">Dokument je podijeljen.</p>
                <p>
                  Dodan {done.shared === 1 ? "1 partneru" : `${done.shared} partnera`}
                  {done.skipped > 0 ? ` (${done.skipped} već imalo isti dokument)` : ""}.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={close} className="btn-primary">Zatvori</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleShare} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Datoteka *</label>
              <label
                className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
                  file ? "border-brand-400 bg-brand-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.svg,.webp,.zip,.docx,.xlsx,.pptx"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                    setError("");
                  }}
                  disabled={busy}
                />
                <FileUp size={20} className="text-gray-400" />
                {file ? (
                  <span className="text-sm text-gray-800 break-all">
                    {file.name}
                    <span className="text-gray-400"> · {formatFileSize(file.size)}</span>
                  </span>
                ) : (
                  <span className="text-xs text-gray-500">Odaberite datoteku (PDF, slika, ZIP…)</span>
                )}
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kome</label>
              <div className="space-y-2">
                {scopeOptions
                  .filter((o) => !o.hidden)
                  .map((o) => (
                    <label
                      key={o.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer text-sm ${
                        scope === o.value
                          ? "border-brand-400 bg-brand-50 text-gray-900"
                          : "border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="share-scope"
                        value={o.value}
                        checked={scope === o.value}
                        onChange={() => setScope(o.value)}
                        disabled={busy}
                      />
                      <span className="flex-1">{o.label}</span>
                      <span className="text-xs text-gray-500">{o.count}</span>
                    </label>
                  ))}
              </div>
            </div>

            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button type="button" onClick={close} className="btn-secondary" disabled={busy}>
                Odustani
              </button>
              <button type="submit" className="btn-primary" disabled={busy || !file || targetIds.length === 0}>
                {busy ? <Loader2 size={15} className="animate-spin" /> : <FileUp size={15} />}
                {busy ? "Dijelim…" : `Podijeli (${targetIds.length})`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
