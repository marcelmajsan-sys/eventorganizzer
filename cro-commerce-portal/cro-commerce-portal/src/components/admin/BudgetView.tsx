"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, X, Check, Loader2, TrendingUp, Wallet, CircleDollarSign, ListChecks, Search } from "lucide-react";

type BudgetStatus = "pending" | "paid" | "cancelled";

interface BudgetItem {
  id: string;
  category: string;
  vendor: string | null;
  amount: number;
  status: BudgetStatus;
  notes: string | null;
  sort_order: number;
}

const STATUS_OPTIONS: { value: BudgetStatus; label: string }[] = [
  { value: "pending",   label: "Na čekanju" },
  { value: "paid",      label: "Plaćeno" },
  { value: "cancelled", label: "Otkazano" },
];

function statusStyle(status: BudgetStatus) {
  switch (status) {
    case "paid":      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "pending":   return "bg-amber-50 text-amber-700 border-amber-200";
    case "cancelled": return "bg-gray-100 text-gray-400 border-gray-200";
  }
}

function statusLabel(status: BudgetStatus) {
  return STATUS_OPTIONS.find(s => s.value === status)?.label ?? status;
}

function formatEur(amount: number) {
  return new Intl.NumberFormat("hr-HR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
}

const emptyForm = {
  category: "",
  vendor:   "",
  amount:   "",
  status:   "pending" as BudgetStatus,
  notes:    "",
};

type FilterTab = "all" | BudgetStatus;

interface Props {
  items: BudgetItem[];
  projectId: string;
}

export default function BudgetView({ items: initial, projectId }: Props) {
  const [items, setItems]           = useState(initial);
  const [filter, setFilter]         = useState<FilterTab>("all");
  const [query, setQuery]           = useState("");
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState<BudgetItem | null>(null);
  const [form, setForm]             = useState(emptyForm);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => { setItems(initial); }, [initial]);

  const q = query.toLowerCase();
  const filtered = items
    .filter(i => filter === "all" || i.status === filter)
    .filter(i => !q || i.category.toLowerCase().includes(q) || (i.vendor ?? "").toLowerCase().includes(q));

  const totalBudget  = items.filter(i => i.status !== "cancelled").reduce((s, i) => s + i.amount, 0);
  const totalPaid    = items.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalPending = items.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const paidPct      = totalBudget > 0 ? Math.round((totalPaid / totalBudget) * 100) : 0;

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  }

  function openEdit(item: BudgetItem) {
    setEditing(item);
    setForm({
      category: item.category,
      vendor:   item.vendor ?? "",
      amount:   String(item.amount),
      status:   item.status,
      notes:    item.notes ?? "",
    });
    setError("");
    setShowModal(true);
  }

  async function handleSave() {
    const amountNum = parseFloat(form.amount.replace(",", ".")) || 0;
    setSaving(true);
    setError("");
    const payload = {
      category: form.category,
      vendor:   form.vendor || null,
      amount:   amountNum,
      status:   form.status,
      notes:    form.notes || null,
    };

    if (editing) {
      const { error: err } = await supabase.from("budget_items").update(payload).eq("id", editing.id);
      setSaving(false);
      if (err) { setError(err.message); return; }
      setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...payload } : i));
    } else {
      const { data, error: err } = await supabase
        .from("budget_items")
        .insert({ ...payload, sort_order: items.length * 10, project_id: projectId })
        .select()
        .single();
      setSaving(false);
      if (err) { setError(err.message); return; }
      if (data) setItems(prev => [...prev, data as BudgetItem]);
    }
    setShowModal(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await supabase.from("budget_items").delete().eq("id", id);
    setItems(prev => prev.filter(i => i.id !== id));
    setConfirmDel(null);
  }

  const canSave = form.category.trim() && !saving;

  const FILTER_TABS: { id: FilterTab; label: string }[] = [
    { id: "all",       label: "Sve" },
    { id: "pending",   label: "Na čekanju" },
    { id: "paid",      label: "Plaćeno" },
    { id: "cancelled", label: "Otkazano" },
  ];

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 font-medium">Ukupni budžet</p>
            <CircleDollarSign size={16} className="text-gray-400" />
          </div>
          <p className="text-xl font-bold text-gray-900">{formatEur(totalBudget)}</p>
          <p className="text-xs text-gray-400 mt-1">{items.filter(i => i.status !== "cancelled").length} stavki</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 font-medium">Plaćeno</p>
            <Wallet size={16} className="text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-emerald-600">{formatEur(totalPaid)}</p>
          <div className="mt-2 bg-gray-100 rounded-full h-1.5">
            <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${paidPct}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">{paidPct}% budžeta</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 font-medium">Na čekanju</p>
            <TrendingUp size={16} className="text-amber-500" />
          </div>
          <p className="text-xl font-bold text-amber-600">{formatEur(totalPending)}</p>
          <p className="text-xs text-gray-400 mt-1">{items.filter(i => i.status === "pending").length} stavki</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 font-medium">Preostalo za platiti</p>
            <ListChecks size={16} className="text-gray-400" />
          </div>
          <p className="text-xl font-bold text-gray-900">{formatEur(totalBudget - totalPaid)}</p>
          <p className="text-xs text-gray-400 mt-1">{100 - paidPct}% budžeta</p>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === tab.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <div className="relative max-w-xs w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Traži kategoriju ili dobavljača..."
                className="input-field pl-8 text-sm py-2"
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={13} />
                </button>
              )}
            </div>
            <button onClick={openAdd} className="btn-primary text-sm py-2 shrink-0">
              <Plus size={14} /> Dodaj trošak
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm">Nema stavki.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Kategorija</th>
                <th className="text-left text-xs font-medium text-gray-500 px-3 py-3">Dobavljač / Kome</th>
                <th className="text-right text-xs font-medium text-gray-500 px-3 py-3">Iznos</th>
                <th className="text-center text-xs font-medium text-gray-500 px-3 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-gray-900">{item.category}</p>
                    {item.notes && <p className="text-xs text-gray-400 mt-0.5">{item.notes}</p>}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-600">{item.vendor ?? "—"}</td>
                  <td className="px-3 py-3 text-sm font-semibold text-gray-900 text-right tabular-nums">
                    {item.amount > 0 ? formatEur(item.amount) : <span className="text-gray-400 font-normal">TBD</span>}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyle(item.status)}`}>
                      {statusLabel(item.status)}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                      <button onClick={() => openEdit(item)} className="p-1 text-gray-400 hover:text-brand-600 transition-colors">
                        <Pencil size={13} />
                      </button>
                      {confirmDel === item.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(item.id)} className="text-xs px-1.5 py-0.5 bg-red-600 text-white rounded hover:bg-red-700">Da</button>
                          <button onClick={() => setConfirmDel(null)} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">Ne</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDel(item.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {filter === "all" && filtered.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td colSpan={2} className="px-5 py-3 text-sm font-semibold text-gray-700">Ukupno</td>
                  <td className="px-3 py-3 text-sm font-bold text-gray-900 text-right tabular-nums">{formatEur(totalBudget)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 pt-8">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-enter">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 text-base">
                {editing ? "Uredi trošak" : "Dodaj trošak"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Kategorija *</label>
                <input
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="input-field text-sm"
                  placeholder="npr. Fotografija, Tehnika..."
                  autoFocus={!editing}
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Dobavljač / Kome</label>
                <input
                  value={form.vendor}
                  onChange={e => setForm({ ...form, vendor: e.target.value })}
                  className="input-field text-sm"
                  placeholder="Ime dobavljača (opcijalno)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Iznos (€)</label>
                  <input
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    className="input-field text-sm"
                    placeholder="0"
                    type="number"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Status *</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value as BudgetStatus })}
                    className="input-field text-sm"
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Napomena</label>
                <input
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="input-field text-sm"
                  placeholder="Dodatne informacije (opcijalno)"
                />
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="btn-secondary text-sm py-2">
                Odustani
              </button>
              <button onClick={handleSave} disabled={!canSave} className="btn-primary text-sm py-2">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {editing ? "Spremi" : "Dodaj"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
