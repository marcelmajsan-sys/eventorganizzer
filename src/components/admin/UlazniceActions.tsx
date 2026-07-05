"use client";

import { useState, useTransition } from "react";
import { Plus, X, Loader2, Trash2, QrCode, Download, ExternalLink, RefreshCw } from "lucide-react";
import { createTicket, deleteTicket, generateMissingSlugs, type TicketFormData } from "@/app/actions/ticketActions";
import { nameToSlug } from "@/lib/slugUtils";
import * as XLSX from "xlsx";

const KATEGORIJE = ["Webshop", "Service Provider", "Speaker", "Ostalo"] as const;
const EMPTY_FORM: TicketFormData = { name: "", email: "", company: "", role: "", ticket_type: "standard", notes: "" };
const APP_URL = "https://partners.ecommerce.hr";

// ── Manual add modal ──────────────────────────────────────────────────────────

function AddModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<TicketFormData>(EMPTY_FORM);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function set(key: keyof TicketFormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Ime i prezime je obavezno."); return; }
    setError(null);
    startTransition(async () => {
      const res = await createTicket(form);
      if (res.error) { setError(res.error); return; }
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg animate-enter">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Dodaj ulaznicu</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ime i prezime *</label>
              <input className="input-field" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Marko Horvat" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input className="input-field" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="marko@firma.hr" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tvrtka</label>
              <input className="input-field" value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Firma d.o.o." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategorija tvrtke</label>
              <select className="input-field" value={form.role} onChange={(e) => set("role", e.target.value)}>
                <option value="">— odaberi —</option>
                {KATEGORIJE.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tip ulaznice</label>
              <div className="flex gap-2 mt-1">
                {(["standard", "vip"] as const).map((t) => (
                  <button key={t} type="button" onClick={() => set("ticket_type", t)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      form.ticket_type === t
                        ? t === "vip" ? "bg-amber-100 border-amber-300 text-amber-800" : "bg-gray-100 border-gray-300 text-gray-700"
                        : "border-gray-200 text-gray-400 hover:border-gray-300"
                    }`}>
                    {t === "vip" ? "VIP" : "Standard"}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Komentar</label>
              <textarea className="input-field resize-none" rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Napomena..." />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Odustani</button>
            <button type="submit" disabled={isPending} className="btn-primary flex-1 justify-center">
              {isPending ? <><Loader2 size={14} className="animate-spin" /> Sprema...</> : "Dodaj ulaznicu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── QR modal ──────────────────────────────────────────────────────────────────

export function QRModal({ slug, name, onClose }: { slug: string; name: string; onClose: () => void }) {
  const url = `${APP_URL}/${slug}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&margin=10`;

  async function handleDownload() {
    // Cross-origin download ne radi s <a download> direktno — fetch → blob → object URL
    try {
      const res = await fetch(qrApiUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `ulaznica-${slug}.png`;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      // Fallback: otvori QR u novom tabu
      window.open(qrApiUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm animate-enter">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 truncate pr-4">{name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X size={18} /></button>
        </div>
        <div className="p-6 text-center space-y-4">
          {/* QR code via public API for download-friendly PNG */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrApiUrl} alt="QR kod" width={220} height={220} className="mx-auto rounded-lg border border-gray-200 p-2" />
          <p className="text-xs text-gray-500 font-mono break-all">{url}</p>
          <div className="flex gap-2 pt-1">
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn-secondary flex-1 justify-center text-sm">
              <ExternalLink size={14} /> Otvori
            </a>
            <button onClick={handleDownload} className="btn-primary flex-1 justify-center text-sm">
              <Download size={14} /> Preuzmi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── QR button (per-row) ───────────────────────────────────────────────────────

export function QRButton({ slug, name }: { slug: string | null; name: string }) {
  const [open, setOpen] = useState(false);
  // Koristi stored slug ako postoji, inače izračunaj iz imena
  const displaySlug = slug ?? nameToSlug(name);
  return (
    <>
      <button onClick={() => setOpen(true)} className="text-gray-400 hover:text-brand-600 transition-colors" title="Prikaži QR kod">
        <QrCode size={16} />
      </button>
      {open && <QRModal slug={displaySlug} name={name} onClose={() => setOpen(false)} />}
    </>
  );
}

// ── Delete button ─────────────────────────────────────────────────────────────

export function DeleteTicketButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirming) return (
    <span className="flex items-center gap-1 text-xs">
      <button onClick={() => startTransition(async () => { const res = await deleteTicket(id); if (res?.error) alert(`Greška pri brisanju ulaznice: ${res.error}`); setConfirming(false); })} disabled={isPending} className="text-red-600 hover:text-red-700 font-medium">
        {isPending ? <Loader2 size={12} className="animate-spin" /> : "Da"}
      </button>
      <span className="text-gray-300">/</span>
      <button onClick={() => setConfirming(false)} className="text-gray-500">Ne</button>
    </span>
  );

  return <button onClick={() => setConfirming(true)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>;
}

// ── Export XLSX button ────────────────────────────────────────────────────────

export type ExportTicketRow = {
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  role: string | null;
  ticket_type: "vip" | "standard" | null;
  notes: string | null;
  slug: string | null;
  sponsorName: string | null;
};

const EXPORT_COL_WIDTHS = [
  { wch: 24 }, { wch: 28 }, { wch: 16 }, { wch: 22 }, { wch: 18 },
  { wch: 12 }, { wch: 30 }, { wch: 22 }, { wch: 44 },
];

function ticketsToSheet(rows: ExportTicketRow[]) {
  const data = rows.map((r) => ({
    "Ime i prezime": r.name,
    "Email": r.email ?? "",
    "Telefon": r.phone ?? "",
    "Tvrtka": r.company ?? "",
    "Kategorija tvrtke": r.role ?? "",
    "Tip ulaznice": r.ticket_type === "vip" ? "VIP" : r.ticket_type === "standard" ? "Standard" : "",
    "Komentar": r.notes ?? "",
    "Partner": r.sponsorName ?? "Ručno",
    "QR link": r.slug ? `${APP_URL}/${r.slug}` : "",
  }));
  const ws = XLSX.utils.json_to_sheet(data, {
    header: [
      "Ime i prezime", "Email", "Telefon", "Tvrtka", "Kategorija tvrtke",
      "Tip ulaznice", "Komentar", "Partner", "QR link",
    ],
  });
  ws["!cols"] = EXPORT_COL_WIDTHS;
  return ws;
}

export function ExportXlsxButton({
  partnerRows,
  manualRows,
  filename,
}: {
  partnerRows: ExportTicketRow[];
  manualRows: ExportTicketRow[];
  filename: string;
}) {
  if (partnerRows.length === 0 && manualRows.length === 0) return null;

  function handleExport() {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ticketsToSheet(partnerRows), "Ulaznice partnera");
    XLSX.utils.book_append_sheet(wb, ticketsToSheet(manualRows), "Ručno dodane");
    XLSX.writeFile(wb, filename);
  }

  return (
    <button onClick={handleExport} className="btn-secondary" title="Preuzmi sve podatke o ulaznicama kao .xlsx">
      <Download size={15} /> Preuzmi .xlsx
    </button>
  );
}

// ── Generate missing slugs button ─────────────────────────────────────────────

export function GenerateSlugsButton({ missingCount }: { missingCount: number }) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  if (missingCount === 0 || done) return null;

  return (
    <button
      onClick={() => startTransition(async () => { await generateMissingSlugs(); setDone(true); })}
      disabled={isPending}
      className="btn-secondary text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100"
      title={`${missingCount} ulaznica nema QR kod`}
    >
      {isPending ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
      Generiraj QR ({missingCount})
    </button>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function UlazniceActions() {
  const [modal, setModal] = useState<"add" | null>(null);

  return (
    <>
      <button onClick={() => setModal("add")} className="btn-primary">
        <Plus size={15} /> Dodaj ulaznicu
      </button>
      {modal === "add" && <AddModal onClose={() => setModal(null)} />}
    </>
  );
}
