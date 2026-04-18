"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, File, Loader2, CheckCircle2 } from "lucide-react";
import { formatDate, formatFileSize } from "@/lib/utils";
import type { FileRecord } from "@/types";

export default function PortalFileUpload({
  sponsorId,
  existingFiles,
}: {
  sponsorId: string;
  existingFiles: FileRecord[];
}) {
  const [files, setFiles] = useState(existingFiles);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [justUploaded, setJustUploaded] = useState<string | null>(null);
  const supabase = createClient();

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    const path = `${sponsorId}/${Date.now()}_${file.name}`;

    const { error: storageError } = await supabase.storage
      .from("sponsor-files")
      .upload(path, file, { upsert: false });

    if (storageError) {
      alert("Greška pri učitavanju: " + storageError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("sponsor-files")
      .getPublicUrl(path);

    const { data: fileRecord } = await supabase
      .from("files")
      .insert({
        sponsor_id: sponsorId,
        filename: file.name,
        storage_url: urlData.publicUrl,
        file_size: file.size,
        mime_type: file.type,
      })
      .select()
      .single();

    if (fileRecord) {
      setFiles((prev) => [fileRecord, ...prev]);
      setJustUploaded(fileRecord.id);
      setTimeout(() => setJustUploaded(null), 3000);
    }
    setUploading(false);
  }, [sponsorId, supabase]);

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    for (const f of dropped) await uploadFile(f);
  }

  async function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    for (const f of selected) await uploadFile(f);
    e.target.value = "";
  }

  return (
    <div className="card p-5">
      <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Upload size={16} className="text-gray-400" />
        Dostava materijala
      </h2>

      <p className="text-sm text-gray-500 mb-4">
        Ovdje možete uploadati logotipe (AI, EPS, SVG, PNG), vizuale, prezentacije i PDF dokumente
        za konferenciju.
      </p>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all mb-5 ${
          dragOver
            ? "border-brand-400 bg-brand-50 scale-[1.01]"
            : "border-gray-200 hover:border-brand-300 hover:bg-gray-50"
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={28} className="text-brand-500 animate-spin" />
            <p className="text-sm text-gray-600">Učitavam datoteku...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload size={20} className="text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Povucite datoteke ovdje
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                PDF, PNG, JPG, SVG, AI, EPS, ZIP (maks. 50 MB)
              </p>
            </div>
            <label className="btn-primary cursor-pointer">
              <input
                type="file"
                multiple
                onChange={handleInput}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.svg,.ai,.eps,.zip,.psd"
              />
              Odaberi datoteke
            </label>
          </div>
        )}
      </div>

      {/* Uploaded files */}
      {files.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Učitane datoteke ({files.length})
          </h3>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  justUploaded === file.id
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-gray-50 border-gray-100"
                }`}
              >
                <File size={15} className="text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <a
                    href={file.storage_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-700 hover:text-brand-600 truncate block"
                  >
                    {file.filename}
                  </a>
                  <p className="text-xs text-gray-400">
                    {file.file_size ? formatFileSize(file.file_size) : ""} · {formatDate(file.uploaded_at)}
                  </p>
                </div>
                {justUploaded === file.id && (
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
