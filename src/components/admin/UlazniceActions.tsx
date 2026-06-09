"use client";

import { useState, useRef, useTransition } from "react";
import { Plus, Upload, X, Loader2, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import { createTicket, bulkCreateTickets, deleteTicket, type TicketFormData } from "@/app/actions/ticketActions";
import * as XLSX from "xlsx";

const KATEGORIJE = ["Webshop", "Service Provider", "Speaker", "Ostalo"] as const;
const EMPTY_FORM: TicketFormData = { name: "", email: "", company: "", role: "", ticket_type: "standard", notes: "" };

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
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("ticket_type", t)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      form.ticket_type === t
                        ? t === "vip"
                          ? "bg-amber-100 border-amber-300 text-amber-800"
                          : "bg-gray-100 border-gray-300 text-gray-700"
                        : "border-gray-200 text-gray-400 hover:border-gray-300"
                    }`}
                  >
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

// ── Bulk upload modal ─────────────────────────────────────────────────────────

type ParsedRow = TicketFormData & { _valid: boolean; _error?: string };

function parseXlsx(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target!.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

        const parsed: ParsedRow[] = rows.map((row) => {
          const name = String(row["Ime i prezime"] ?? row["ime i prezime"] ?? row["name"] ?? "").trim();
          const email = String(row["Email"] ?? row["email"] ?? "").trim();
          const company = String(row["Tvrtka"] ?? row["tvrtka"] ?? row["company"] ?? "").trim();
          const roleRaw = String(row["Kategorija tvrtke"] ?? row["kategorija"] ?? row["role"] ?? "").trim();
          const role = KATEGORIJE.includes(roleRaw as any) ? roleRaw : roleRaw ? "Ostalo" : "";
          const tipRaw = String(row["Tip ulaznice"] ?? row["tip"] ?? row["ticket_type"] ?? "standard").trim().toLowerCase();
          const ticket_type: "vip" | "standard" = tipRaw === "vip" ? "vip" : "standard";
          const notes = String(row["Komentar"] ?? row["komentar"] ?? row["notes"] ?? "").trim();

          const valid = name.length > 0;
          return { name, email, company, role, ticket_type, notes, _valid: valid, _error: valid ? undefined : "Ime je obavezno" };
        });

        resolve(parsed);
      } catch (err: any) {
        reject(new Error("Ne mogu pročitati datoteku: " + err.message));
      }
    };
    reader.onerror = () => reject(new Error("Greška pri čitanju datoteke"));
    reader.readAsArrayBuffer(file);
  });
}

function BulkModal({ onClose }: { onClose: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ inserted: number; error: string | null } | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError(null);
    setRows([]);
    try {
      const parsed = await parseXlsx(file);
      setRows(parsed);
    } catch (err: any) {
      setParseError(err.message);
    }
  }

  function handleImport() {
    const valid = rows.filter((r) => r._valid);
    if (valid.length === 0) return;
    startTransition(async () => {
      const res = await bulkCreateTickets(valid);
      setResult(res);
    });
  }

  const validCount = rows.filter((r) => r._valid).length;
  const invalidCount = rows.length - validCount;

  if (result) {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4 bg-black/40">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 text-center animate-enter">
          {result.error ? (
            <><AlertCircle size={40} className="text-red-500 mx-auto mb-3" /><p className="font-semibold text-gray-900">Greška</p><p className="text-sm text-gray-500 mt-1">{result.error}</p></>
          ) : (
            <><CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3" /><p className="font-semibold text-gray-900">Uvezeno {result.inserted} ulaznica</p></>
          )}
          <button onClick={onClose} className="btn-primary mt-6 w-full justify-center">Zatvori</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4 bg-black/40 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl animate-enter mb-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Bulk upload ulaznica (.xlsx)</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Format info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
            <p className="font-medium mb-1">Očekivane kolone u .xlsx datoteci:</p>
            <p className="text-blue-600 font-mono text-xs">Ime i prezime | Email | Tvrtka | Kategorija tvrtke | Tip ulaznice | Komentar</p>
            <p className="mt-1.5 text-xs text-blue-500">Kategorija: Webshop / Service Provider / Speaker / Ostalo &nbsp;·&nbsp; Tip: VIP / Standard</p>
          </div>

          {/* File picker */}
          <div>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />
            <button onClick={() => fileRef.current?.click()} className="btn-secondary w-full justify-center">
              <Upload size={15} /> Odaberi .xlsx datoteku
            </button>
          </div>

          {parseError && <p className="text-sm text-red-600">{parseError}</p>}

          {/* Preview */}
          {rows.length > 0 && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{rows.length} redaka pronađeno</span>
                <span className="flex gap-3">
                  {validCount > 0 && <span className="text-emerald-600 font-medium">{validCount} validnih</span>}
                  {invalidCount > 0 && <span className="text-red-500 font-medium">{invalidCount} s greškom</span>}
                </span>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-72 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Ime i prezime</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Email</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Tvrtka</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Kategorija</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Tip</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.map((r, i) => (
                      <tr key={i} className={r._valid ? "" : "bg-red-50"}>
                        <td className="px-3 py-2 font-medium text-gray-900">{r.name || <span className="text-red-400 italic">prazno</span>}</td>
                        <td className="px-3 py-2 text-gray-600">{r.email || "—"}</td>
                        <td className="px-3 py-2 text-gray-600">{r.company || "—"}</td>
                        <td className="px-3 py-2 text-gray-600">{r.role || "—"}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${r.ticket_type === "vip" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"}`}>
                            {r.ticket_type === "vip" ? "VIP" : "Standard"}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {r._valid
                            ? <span className="text-emerald-600">✓</span>
                            : <span className="text-red-500">{r._error}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={onClose} className="btn-secondary flex-1 justify-center">Odustani</button>
                <button
                  onClick={handleImport}
                  disabled={isPending || validCount === 0}
                  className="btn-primary flex-1 justify-center"
                >
                  {isPending
                    ? <><Loader2 size={14} className="animate-spin" /> Uvoz...</>
                    : `Uvezi ${validCount} ulaznica`}
                </button>
              </div>
            </>
          )}

          {rows.length === 0 && !parseError && (
            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="btn-secondary flex-1 justify-center">Odustani</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Delete button ─────────────────────────────────────────────────────────────

export function DeleteTicketButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirming) {
    return (
      <span className="flex items-center gap-1 text-xs">
        <button onClick={() => startTransition(async () => { await deleteTicket(id); setConfirming(false); })} disabled={isPending} className="text-red-600 hover:text-red-700 font-medium">
          {isPending ? <Loader2 size={12} className="animate-spin" /> : "Da"}
        </button>
        <span className="text-gray-300">/</span>
        <button onClick={() => setConfirming(false)} className="text-gray-500 hover:text-gray-700">Ne</button>
      </span>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} className="text-gray-300 hover:text-red-500 transition-colors">
      <Trash2 size={15} />
    </button>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function UlazniceActions() {
  const [modal, setModal] = useState<"add" | "bulk" | null>(null);

  return (
    <>
      <div className="flex gap-2">
        <button onClick={() => setModal("bulk")} className="btn-secondary">
          <Upload size={15} /> Bulk upload (.xlsx)
        </button>
        <button onClick={() => setModal("add")} className="btn-primary">
          <Plus size={15} /> Dodaj ulaznicu
        </button>
      </div>

      {modal === "add" && <AddModal onClose={() => setModal(null)} />}
      {modal === "bulk" && <BulkModal onClose={() => setModal(null)} />}
    </>
  );
}
