"use client";

import { Download } from "lucide-react";
import {
  contactTypeLabel,
  leadStatusLabel,
  paymentStatusLabel,
} from "@/lib/utils";
import type { LeadStatus, PaymentStatus } from "@/types";

export interface ExportContactRow {
  id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;
  type: string | null;
  company: string | null;
  ticket_type: string | null;
  notes: string | null;
}

export interface ExportSponsorRow {
  id: string;
  name: string;
  package_type: string | null;
  lead_status: string | null;
  payment_status: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  sponsor_contacts: ExportContactRow[] | null;
}

/** Ključevi (ime i email) za deduplikaciju primarnog kontakta i istog zapisa u sponsor_contacts. */
function dedupeKeys(name: string | null, email: string | null): string[] {
  const keys: string[] = [];
  const e = email?.trim().toLowerCase();
  const n = name?.trim().toLowerCase();
  if (e) keys.push("e:" + e);
  if (n) keys.push("n:" + n);
  return keys;
}

function ticketTypeLabel(t: string | null): string {
  if (!t) return "";
  return t === "vip" ? "VIP" : t === "standard" ? "Standard" : t;
}

/** Jedan redak po kontaktu; partneri bez ijednog kontakta dobivaju placeholder redak. */
function buildRows(sponsors: ExportSponsorRow[]) {
  const out: Record<string, string | number>[] = [];

  for (const s of sponsors) {
    const base = {
      Partner: s.name,
      Paket: s.package_type ?? "",
      Status: s.lead_status ? leadStatusLabel(s.lead_status as LeadStatus) : "",
      "Plaćanje": s.payment_status
        ? paymentStatusLabel(s.payment_status as PaymentStatus)
        : "",
    };

    const contacts = s.sponsor_contacts ?? [];
    const seen = new Set<string>();
    let added = 0;

    const hasPrimary = Boolean(s.contact_name || s.contact_email || s.contact_phone);
    let primaryRow: Record<string, string | number> | null = null;
    if (hasPrimary) {
      for (const k of dedupeKeys(s.contact_name, s.contact_email)) seen.add(k);
      primaryRow = {
        ...base,
        "Tip kontakta": "Primarni kontakt",
        "Ime i prezime": s.contact_name ?? "",
        Email: s.contact_email ?? "",
        Telefon: s.contact_phone ?? "",
        Funkcija: "",
        "Tvrtka kontakta": "",
        "Tip ulaznice": "",
        Napomena: "",
      };
      out.push(primaryRow);
      added++;
    }

    for (const c of contacts) {
      const keys = dedupeKeys(c.name, c.email);
      // Primarni kontakt je često zrcaljen i u sponsor_contacts (migration_033):
      // ne dupliciramo redak, nego nadopunimo polja koja primarni kontakt nema.
      if (keys.some((k) => seen.has(k))) {
        if (primaryRow) {
          if (!primaryRow.Email && c.email) primaryRow.Email = c.email;
          if (!primaryRow.Telefon && c.phone) primaryRow.Telefon = c.phone;
          if (!primaryRow.Funkcija && c.role) primaryRow.Funkcija = c.role;
          if (!primaryRow["Tvrtka kontakta"] && c.company) primaryRow["Tvrtka kontakta"] = c.company;
          if (!primaryRow["Tip ulaznice"] && c.ticket_type) primaryRow["Tip ulaznice"] = ticketTypeLabel(c.ticket_type);
          if (!primaryRow.Napomena && c.notes) primaryRow.Napomena = c.notes;
        }
        continue;
      }
      for (const k of keys) seen.add(k);
      out.push({
        ...base,
        "Tip kontakta": contactTypeLabel(c.type),
        "Ime i prezime": c.name ?? "",
        Email: c.email ?? "",
        Telefon: c.phone ?? "",
        Funkcija: c.role ?? "",
        "Tvrtka kontakta": c.company ?? "",
        "Tip ulaznice": ticketTypeLabel(c.ticket_type),
        Napomena: c.notes ?? "",
      });
      added++;
    }

    if (added === 0) {
      out.push({
        ...base,
        "Tip kontakta": "(bez kontakta)",
        "Ime i prezime": "",
        Email: "",
        Telefon: "",
        Funkcija: "",
        "Tvrtka kontakta": "",
        "Tip ulaznice": "",
        Napomena: "",
      });
    }
  }

  return out;
}

/** Broj kontakata koji bi završili u exportu — za labelu gumba. */
export function countExportableContacts(sponsors: ExportSponsorRow[]): number {
  return buildRows(sponsors).filter((r) => r["Tip kontakta"] !== "(bez kontakta)").length;
}

export default function ExportContactsButton({
  sponsors,
}: {
  sponsors: ExportSponsorRow[];
}) {
  if (sponsors.length === 0) return null;

  async function handleExport() {
    const { utils, writeFile } = await import("xlsx");

    const ws = utils.json_to_sheet(buildRows(sponsors));
    ws["!cols"] = [
      { wch: 30 }, // Partner
      { wch: 14 }, // Paket
      { wch: 18 }, // Status
      { wch: 20 }, // Plaćanje
      { wch: 20 }, // Tip kontakta
      { wch: 26 }, // Ime i prezime
      { wch: 32 }, // Email
      { wch: 18 }, // Telefon
      { wch: 22 }, // Funkcija
      { wch: 24 }, // Tvrtka kontakta
      { wch: 14 }, // Tip ulaznice
      { wch: 40 }, // Napomena
    ];

    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Kontakti");
    writeFile(wb, `kontakti_partnera_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  const count = countExportableContacts(sponsors);

  return (
    <button
      onClick={handleExport}
      className="btn-secondary"
      title={`Preuzmi ${count} kontakata od ${sponsors.length} prikazanih partnera kao .xlsx`}
    >
      <Download size={15} /> Preuzmi kontakte ({count})
    </button>
  );
}
