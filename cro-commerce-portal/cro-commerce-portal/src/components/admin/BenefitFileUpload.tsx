"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, File, Trash2, Loader2 } from "lucide-react";

interface BenefitFile {
  id: string;
  filename: string;
  storage_url: string;
  file_size: number | null;
}

interface Props {
  benefitId: string;
  sponsorId: string;
  initialFiles: BenefitFile[];
}

export default function BenefitFileUpload({ benefitId, sponsorId, initialFiles }: Props) {
  const [files, setFiles] = useState(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const upload = useCallback(async (file: File) => {
    setUploading(true);
    setError("");
    const path = `${sponsorId}/benefits/${benefitId}/${Date.now()}_${file.name}`;

    const { error: storErr } = await supabase.storage.from("sponsor-files").upload(path, file);
    if (storErr) { setError(storErr.message); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from("sponsor-files").getPublicUrl(path);
    const { data: rec, error: dbErr } = await supabase
      .from("files")
      .insert({
        sponsor_id: sponsorId,
        benefit_id: benefitId,
        filename: file.name,
        storage_url: urlData.publicUrl,
        file_size: file.size,
        mime_type: file.type,
      })
      .select()
      .single();

    if (dbErr) { setError(dbErr.message); setUploading(false); return; }
    if (rec) setFiles((prev) => [rec, ...prev]);
    setUploading(false);
  }, [benefitId, sponsorId, supabase]);

  async function handleDelete(fileId: string, storageUrl: string) {
    const path = storageUrl.split("/sponsor-files/")[1];
    if (path) await supabase.storage.from("sponsor-files").remove([path]);
    await supabase.from("files").delete().eq("id", fileId);
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  }

  return (
    <div className="space-y-1.5">
      <label className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
        uploading ? "opacity-50 cursor-not-allowed border-gray-200" : "border-gray-200 hover:border-brand-300 hover:bg-brand-50 text-gray-600"
      }`}>
        {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
        {uploading ? "Učitavam..." : "Dodaj dokument"}
        <input
          type="file"
          className="hidden"
          disabled={uploading}
          accept=".pdf,.png,.jpg,.jpeg,.svg,.zip,.doc,.docx"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) await upload(f);
            e.target.value = "";
          }}
        />
      </label>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {files.map((f) => (
        <div key={f.id} className="flex items-center gap-2 text-xs bg-gray-50 rounded-lg px-2.5 py-1.5 group">
          <File size={11} className="text-gray-400 flex-shrink-0" />
          <a
            href={f.storage_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-gray-700 hover:text-brand-600 truncate"
          >
            {f.filename}
          </a>
          {f.file_size && (
            <span className="text-gray-400 flex-shrink-0">
              {Math.round(f.file_size / 1024)}KB
            </span>
          )}
          <button
            onClick={() => handleDelete(f.id, f.storage_url)}
            className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
          >
            <Trash2 size={11} />
          </button>
        </div>
      ))}

      {files.length === 0 && !uploading && (
        <p className="text-xs text-gray-400">Nema dokumenata</p>
      )}
    </div>
  );
}
