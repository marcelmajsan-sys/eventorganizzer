"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronRight, CheckSquare, Square, Minus } from "lucide-react";
import { packageColor, paymentStatusColor, paymentStatusLabel, leadStatusColor, leadStatusLabel } from "@/lib/utils";
import type { PackageType, PaymentStatus, LeadStatus } from "@/types";
import { bulkUpdateSponsors } from "@/app/actions/sponsorBulkUpdate";

interface SponsorRow {
  id: string;
  name: string;
  package_type: string | null;
  lead_status: string | null;
  payment_status: string;
  contact_name: string | null;
  contact_email: string | null;
  iznos: number | null;
  sponsor_benefits: { id: string; status: string }[];
  sponsor_contacts: { name: string | null; email: string | null; type: string }[];
}

const formatEur = (n: number) =>
  new Intl.NumberFormat("hr-HR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

interface Props {
  sponsors: SponsorRow[];
  packageTypeNames: string[];
}

const PAYMENT_STATUSES = [
  { value: "paid",    label: "Plaćeno" },
  { value: "partial", label: "Djelomično plaćeno" },
  { value: "pending", label: "Na čekanju" },
  { value: "overdue", label: "Kasni" },
];

const LEAD_STATUSES = [
  { value: "cold_lead",           label: "Cold Lead" },
  { value: "hot_lead",            label: "Hot Lead" },
  { value: "confirmed_new",       label: "Potvrđeno Novi" },
  { value: "confirmed_returning", label: "Potvrđeno Stari" },
];

export default function SponsorsTableWithSelect({ sponsors, packageTypeNames }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkPackage, setBulkPackage] = useState("");
  const [bulkPayment, setBulkPayment] = useState("");
  const [bulkLead, setBulkLead] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const allSelected = sponsors.length > 0 && selected.size === sponsors.length;
  const someSelected = selected.size > 0 && !allSelected;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(sponsors.map((s) => s.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
    setBulkPackage("");
    setBulkPayment("");
    setBulkLead("");
    setError(null);
  }

  function applyBulk() {
    if (!bulkPackage && !bulkPayment && !bulkLead) {
      setError("Odaberi barem jedno polje za ažuriranje");
      return;
    }
    setError(null);
    startTransition(async () => {
      const fields: { package_type?: string; payment_status?: string; lead_status?: string | null } = {};
      if (bulkPackage) fields.package_type = bulkPackage;
      if (bulkPayment) fields.payment_status = bulkPayment;
      if (bulkLead === "__clear__") fields.lead_status = null;
      else if (bulkLead) fields.lead_status = bulkLead;

      const result = await bulkUpdateSponsors(Array.from(selected), fields);
      if (result.error) {
        setError(result.error);
      } else {
        clearSelection();
      }
    });
  }

  return (
    <>
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="sticky top-0 z-10 mb-4 bg-brand-50 border border-brand-200 rounded-xl p-3 flex flex-wrap items-center gap-3 shadow-sm">
          <span className="text-sm font-medium text-brand-700 shrink-0">
            {selected.size} {selected.size === 1 ? "sponzor odabran" : "sponzora odabrano"}
          </span>

          <div className="flex flex-wrap gap-2 flex-1">
            {/* Package select */}
            <select
              value={bulkPackage}
              onChange={(e) => setBulkPackage(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Paket (bez promjene)</option>
              {packageTypeNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            {/* Payment select */}
            <select
              value={bulkPayment}
              onChange={(e) => setBulkPayment(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Plaćanje (bez promjene)</option>
              {PAYMENT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            {/* Lead status select */}
            <select
              value={bulkLead}
              onChange={(e) => setBulkLead(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Status (bez promjene)</option>
              {LEAD_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
              <option value="__clear__">— Ukloni status</option>
            </select>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {error && <span className="text-xs text-red-600">{error}</span>}
            <button
              onClick={applyBulk}
              disabled={isPending}
              className="px-4 py-1.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? "Spremam..." : "Primijeni"}
            </button>
            <button
              onClick={clearSelection}
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              Poništi odabir
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="py-3 px-4 w-10">
                  <button onClick={toggleAll} className="text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center">
                    {allSelected ? (
                      <CheckSquare size={16} className="text-brand-600" />
                    ) : someSelected ? (
                      <Minus size={16} className="text-brand-400" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Tvrtka</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Paket</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Kontakt</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">Iznos</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Plaćanje</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Benefiti</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sponsors.map((sponsor) => {
                const benefits = sponsor.sponsor_benefits ?? [];
                const completed = benefits.filter((b) => b.status === "completed").length;
                const total = benefits.length;
                const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                const contacts = sponsor.sponsor_contacts ?? [];
                const primaryContact = contacts.find((c) => c.type === "contact") ?? contacts[0] ?? null;
                const contactName = primaryContact?.name ?? sponsor.contact_name;
                const contactEmail = primaryContact?.email ?? sponsor.contact_email;
                const isSelected = selected.has(sponsor.id);

                return (
                  <tr
                    key={sponsor.id}
                    onClick={(e) => {
                      const tag = (e.target as HTMLElement).tagName.toLowerCase();
                      if (tag === "a" || (e.target as HTMLElement).closest("a")) return;
                      toggleOne(sponsor.id);
                    }}
                    className={`transition-colors group cursor-pointer ${
                      isSelected ? "bg-brand-50 hover:bg-brand-50/80" : "hover:bg-gray-50/60"
                    }`}
                  >
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleOne(sponsor.id)}
                        className="text-gray-400 hover:text-brand-600 transition-colors flex items-center justify-center"
                      >
                        {isSelected ? (
                          <CheckSquare size={16} className="text-brand-600" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={`/admin/sponsors/${sponsor.id}`}
                        className="font-semibold text-gray-900 hover:text-brand-600 transition-colors"
                      >
                        {sponsor.name}
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${packageColor(sponsor.package_type as PackageType)}`}>
                        {sponsor.package_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {sponsor.lead_status ? (
                        <span className={`badge border ${leadStatusColor(sponsor.lead_status as LeadStatus)}`}>
                          {leadStatusLabel(sponsor.lead_status as LeadStatus)}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-700">{contactName}</p>
                      <p className="text-gray-400 text-xs">{contactEmail}</p>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`text-sm font-medium ${(sponsor.iznos ?? 0) > 0 ? "text-gray-900" : "text-gray-300"}`}>
                        {formatEur(sponsor.iznos ?? 0)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${paymentStatusColor(sponsor.payment_status as PaymentStatus)}`}>
                        {paymentStatusLabel(sponsor.payment_status as PaymentStatus)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{completed}/{total}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/sponsors/${sponsor.id}`}
                        className="inline-flex items-center gap-1 text-gray-400 hover:text-brand-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <span className="text-xs">Detalji</span>
                        <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {sponsors.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <p className="text-gray-400">Nema sponzora koji odgovaraju filteru</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
