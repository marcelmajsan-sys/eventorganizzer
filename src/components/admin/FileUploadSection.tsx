"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Upload, FileText, Trash2, Loader2, File } from "lucide-react";
import { formatDate, formatFileSize } from "@/lib/utils";
import type { FileRecord } from "@/types";

export default function FileUploadSection({
  sponsorId,
  existingFiles,
}: {
  sponsorId: string;
  existingFiles: FileRecord[];
}) {
  const [files, setFiles] = useState(existingFiles);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    setUploadError("");
    const path = `${sponsorId}/${Date.now()}_${file.name}`;

    const { error: storageError } = await supabase.storage
      .from("sponsor-files")
      .upload(path, file, { upsert: false });

    if (storageError) {
      setUploadError(`Storage greška: ${storageError.message}`);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("sponsor-files")
      .getPublicUrl(path);

    const { data: fileRecord, error: dbError } = await supabase
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

    if (dbError) {
      setUploadError(`DB greška: ${dbError.message}`);
      setUploading(false);
      return;
    }
    if (fileRecord) {
      setFiles((prev) => [fileRecord, ...prev]);
    }
    setUploading(false);
    router.refresh();
  }, [sponsorId, supabase, router]);

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    for (const file of droppedFiles) await uploadFile(file);
  }

  async function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files ?? []);
    for (const file of selectedFiles) await uploadFile(file);
    e.target.value = "";
  }

  async function handleDelete(fileId: string, storageUrl: string) {
    const path = storageUrl.split("/sponsor-files/")[1];
    if (path) await supabase.storage.from("sponsor-files").remove([path]);
    await supabase.from("files").delete().eq("id", fileId);
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  }

  return (
    <div className="card p-5">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileText size={16} className="text-gray-400" />
        Datoteke ({files.length})
      </h3>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors mb-4 ${
          dragOver ? "border-brand-400 bg-brand-50" : "border-gray-200 hover:border-gray-300"
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2 size={20} className="text-brand-500 animate-spin" />
            <p className="text-sm text-gray-500">Učitavam...</p>
          </div>
        ) : (
          <>
            <Upload size={20} className="text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500 mb-2">Povucite datoteke ili kliknite</p>
            <label className="btn-secondary text-xs cursor-pointer">
              <input
                type="file"
                multiple
                onChange={handleFileInput}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.svg,.ai,.eps,.zip"
              />
              Odaberi datoteke
            </label>
          </>
        )}
      </div>

      {uploadError && (
        <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          {uploadError}
        </div>
      )}

      {/* File list */}
      <div className="space-y-2">
        {files.map((file) => (
          <div key={file.id} className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg group">
            <File size={14} className="text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <a
                href={file.storage_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-gray-700 hover:text-brand-600 truncate block"
              >
                {file.filename}
              </a>
              <p className="text-xs text-gray-400">
                {file.file_size ? formatFileSize(file.file_size) : ""} · {formatDate(file.uploaded_at)}
              </p>
            </div>
            <button
              onClick={() => handleDelete(file.id, file.storage_url)}
              className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        {files.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-2">Nema učitanih datoteka</p>
        )}
      </div>
    </div>
  );
}
