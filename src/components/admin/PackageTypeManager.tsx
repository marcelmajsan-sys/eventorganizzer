"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

interface PackageTypeRow {
  id: string;
  name: string;
}

interface Props {
  packageTypes: PackageTypeRow[];
  activePackages: string[];
  activePayment?: string;
}

export default function PackageTypeManager({ packageTypes, activePackages, activePayment }: Props) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function buildUrl(packages: string[]) {
    const params = new URLSearchParams();
    if (packages.length > 0) params.set("package", packages.join(","));
    if (activePayment) params.set("payment", activePayment);
    return `/admin/sponsors${params.size ? "?" + params.toString() : ""}`;
  }

  function toggle(name: string) {
    const next = activePackages.includes(name)
      ? activePackages.filter((p) => p !== name)
      : [...activePackages, name];
    return buildUrl(next);
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
        href={buildUrl([])}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          activePackages.length === 0 ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        Svi
      </a>

      {packageTypes.map((pkg) => {
        const isActive = activePackages.includes(pkg.name);
        return (
          <a
            key={pkg.id}
            href={toggle(pkg.name)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {pkg.name}
            {isActive && <X size={11} className="opacity-70" />}
          </a>
        );
      })}

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
