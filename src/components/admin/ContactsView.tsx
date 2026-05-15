"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, ChevronRight, Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AddContactModal from "@/components/admin/AddContactModal";

interface Contact {
  id: string;
  sponsor_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  company: string | null;
  type: string;
}

const TYPE_LABELS: Record<string, string> = {
  contact:          "Kontakt",
  ticket:           "Ulaznica",
  partner:          "Partner",
  visitor:          "Visitor",
  speaker:          "Speaker",
  service_provider: "Service Provider",
  brand_ambassador: "Brand Ambassador",
};

const TYPE_STYLE: Record<string, string> = {
  contact:          "bg-blue-50 text-blue-700 border-blue-200",
  ticket:           "bg-amber-50 text-amber-700 border-amber-200",
  partner:          "bg-brand-50 text-brand-700 border-brand-200",
  visitor:          "bg-teal-50 text-teal-700 border-teal-200",
  speaker:          "bg-purple-50 text-purple-700 border-purple-200",
  service_provider: "bg-gray-100 text-gray-600 border-gray-200",
  brand_ambassador: "bg-pink-50 text-pink-700 border-pink-200",
};

interface Sponsor {
  id: string;
  name: string;
}

interface Props {
  contacts: Contact[];
  sponsors: Sponsor[];
}

export default function ContactsView({ contacts, sponsors }: Props) {
  const [selectedSponsor, setSelectedSponsor] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const sponsorMap = Object.fromEntries(sponsors.map((s) => [s.id, s.name]));

  const usedTypes = Array.from(new Set(contacts.map((c) => c.type))).sort();

  const filtered = contacts.filter((c) => {
    const matchesSponsor = selectedSponsor === "all" || c.sponsor_id === selectedSponsor;
    const matchesType = selectedType === "all" || c.type === selectedType;
    const q = query.toLowerCase();
    const matchesSearch =
      !q ||
      (c.name ?? "").toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q) ||
      (c.role ?? "").toLowerCase().includes(q) ||
      (c.company ?? "").toLowerCase().includes(q) ||
      (c.sponsor_id ? sponsorMap[c.sponsor_id] ?? "" : "").toLowerCase().includes(q);
    return matchesSponsor && matchesType && matchesSearch;
  });

  const sponsorsWithContacts = sponsors.filter((s) =>
    contacts.some((c) => c.sponsor_id === s.id)
  );

  const allFilteredIds = filtered.map((c) => c.id);
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedIds.has(id));
  const someSelected = allFilteredIds.some((id) => selectedIds.has(id));

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allFilteredIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => new Set([...Array.from(prev), ...allFilteredIds]));
    }
  }

  async function handleDeleteOne(id: string, name: string) {
    if (!confirm(`Obriši kontakt "${name}"?`)) return;
    await supabase.from("sponsor_contacts").delete().eq("id", id);
    setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    router.refresh();
  }

  async function handleBulkDelete() {
    const count = selectedIds.size;
    if (!confirm(`Obriši ${count} odabranih kontakata?`)) return;
    setDeleting(true);
    await supabase.from("sponsor_contacts").delete().in("id", Array.from(selectedIds));
    setSelectedIds(new Set());
    setDeleting(false);
    router.refresh();
  }

  return (
    <div className="animate-enter">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Kontakti</h1>
          <p className="page-subtitle">{contacts.length} kontakata ukupno</p>
        </div>
        <AddContactModal />
      </div>

      {/* Bulk delete bar */}
      {someSelected && (
        <div className="flex items-center justify-between bg-brand-50 border border-brand-200 rounded-xl px-4 py-2.5 mb-4">
          <span className="text-sm font-medium text-brand-700">
            {selectedIds.size} odabrano
          </span>
          <button
            onClick={handleBulkDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Obriši odabrane
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pretraži po imenu, emailu, funkciji ili sponzoru..."
          className="input-field pl-9 pr-8"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Type filters */}
      <div className="flex gap-2 flex-wrap mb-3">
        <button
          onClick={() => setSelectedType("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
            selectedType === "all"
              ? "bg-brand-600 text-white border-brand-600"
              : "bg-white border-gray-200 text-gray-600 hover:border-brand-300"
          }`}
        >
          Svi tipovi
        </button>
        {usedTypes.map((t) => {
          const count = contacts.filter((c) => c.type === t).length;
          return (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                selectedType === t
                  ? "bg-brand-600 text-white border-brand-600"
                  : `${TYPE_STYLE[t] ?? "bg-gray-100 text-gray-600 border-gray-200"} hover:border-brand-300`
              }`}
            >
              {TYPE_LABELS[t] ?? t} ({count})
            </button>
          );
        })}
      </div>

      {/* Sponsor filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setSelectedSponsor("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
            selectedSponsor === "all"
              ? "bg-brand-600 text-white border-brand-600"
              : "bg-white border-gray-200 text-gray-600 hover:border-brand-300"
          }`}
        >
          Sve tvrtke ({contacts.length})
        </button>
        {sponsorsWithContacts.map((s) => {
          const count = contacts.filter((c) => c.sponsor_id === s.id).length;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedSponsor(s.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                selectedSponsor === s.id
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white border-gray-200 text-gray-600 hover:border-brand-300"
              }`}
            >
              {s.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 w-px">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                    onChange={toggleAll}
                    className="rounded border-gray-300 text-brand-600 cursor-pointer"
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ime</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Firma</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Telefon</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Funkcija</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Sponzor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Tip</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((c) => (
                <tr key={c.id} className={`hover:bg-gray-50 transition-colors group ${selectedIds.has(c.id) ? "bg-brand-50/40" : ""}`}>
                  <td className="px-4 py-3 w-px">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(c.id)}
                      onChange={() => toggleOne(c.id)}
                      className="rounded border-gray-300 text-brand-600 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                    <Link href={`/admin/contacts/${c.id}`} className="hover:text-brand-600 transition-colors">
                      {c.name || <span className="text-gray-300">—</span>}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell whitespace-nowrap">
                    {c.company ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.email ? (
                      <a href={`mailto:${c.email}`} className="hover:text-brand-600 transition-colors">
                        {c.email}
                      </a>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell whitespace-nowrap">
                    {c.phone ? (
                      <a href={`tel:${c.phone}`} className="hover:text-brand-600 transition-colors">
                        {c.phone}
                      </a>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                    {c.role ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap hidden sm:table-cell">
                    {c.sponsor_id && sponsorMap[c.sponsor_id] ? (
                      <Link
                        href={`/admin/sponsors/${c.sponsor_id}`}
                        className="text-brand-600 hover:text-brand-700 hover:underline"
                      >
                        {sponsorMap[c.sponsor_id]}
                      </Link>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`badge ${TYPE_STYLE[c.type] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                      {TYPE_LABELS[c.type] ?? c.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 w-px whitespace-nowrap">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDeleteOne(c.id, c.name)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Obriši"
                      >
                        <Trash2 size={14} />
                      </button>
                      <Link
                        href={`/admin/contacts/${c.id}`}
                        className="inline-flex items-center gap-1 text-gray-400 hover:text-brand-600 transition-colors"
                      >
                        <span className="text-xs">Detalji</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">
                    Nema kontakata
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
            Prikazano {filtered.length} od {contacts.length} kontakata
          </div>
        )}
      </div>
    </div>
  );
}
