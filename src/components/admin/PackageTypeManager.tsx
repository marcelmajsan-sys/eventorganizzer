"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, X, Loader2 } from "lucide-react";
import { packageColor } from "@/lib/utils";
import type { PackageType } from "@/types";

interface PackageTypeRow {
  id: string;
  name: string;
}

interface Props {
  packageTypes: PackageTypeRow[];
  activePackage?: string;
  activePayment?: string;
}

export default function PackageTypeManager({ packageTypes, activePackage, activePayment }: Props) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  function buildUrl(pkg?: string) {
    const params = new URLSearchParams();
    if (pkg) params.set("package", pkg);
    if (activePayment) params.set("payment", activePayment);
    return `/admin/sponsors${params.size ? "?" + params.toString() : ""}`;
  }

  async function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    setSaving(true);
    setError("");
    const { error: err } = await supabase.from("package_types").insert({ name });
    setSaving(false);
    if (err) { setError(err.message); return; }
    setNewName("");
    setAdding(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <a
        href={buildUrl()}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          !activePackage ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        Svi
      </a>

      {packageTypes.map((pkg) => (
        <div key={pkg.id} className="relative group/pkg flex items-center">
          <a
            href={buildUrl(pkg.name)}
            className={`px-3 py-1.5 pr-7 rounded-lg text-sm font-medium transition-colors ${
              activePackage === pkg.name
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {pkg.name}
          </a>
          <button
            onClick={async () => {
              if (!confirm(`Obriši kategoriju "${pkg.name}"?`)) return;
              await supabase.from("package_types").delete().eq("id", pkg.id);
              router.refresh();
            }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover/pkg:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
            title="Obriši kategoriju"
          >
            <X size={12} />
          </button>
        </div>
      ))}

      {adding ? (
        <div className="flex items-center gap-1.5">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") { setAdding(false); setNewName(""); } }}
            placeholder="Naziv kategorije"
            className="px-2.5 py-1.5 text-sm border border-brand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 w-40"
            autoFocus
          />
          <button
            onClick={handleAdd}
            disabled={!newName.trim() || saving}
            className="p-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          </button>
          <button
            onClick={() => { setAdding(false); setNewName(""); setError(""); }}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
          >
            <X size={14} />
          </button>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg transition-colors"
          title="Dodaj kategoriju"
        >
          <Plus size={14} />
        </button>
      )}
    </div>
  );
}
