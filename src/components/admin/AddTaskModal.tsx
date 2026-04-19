"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, X, Loader2 } from "lucide-react";

const SPONSOR_CATEGORIES = ["Glavni", "Zlatni", "Srebrni", "Brončani", "Medijski", "Community"];

interface Props {
  sponsors: { id: string; name: string }[];
  benefitNames: string[];
}

export default function AddTaskModal({ sponsors, benefitNames }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    title: "",
    description: "",
    sponsor_id: "",
    status: "todo",
    due_date: "",
    assigned_to: "",
    benefit_name: "",
    sponsor_category: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload: Record<string, any> = { ...form };
    if (!payload.sponsor_id) delete payload.sponsor_id;
    if (!payload.due_date) delete payload.due_date;
    if (!payload.assigned_to) delete payload.assigned_to;
    if (!payload.benefit_name) delete payload.benefit_name;
    if (!payload.sponsor_category) delete payload.sponsor_category;

    await supabase.from("tasks").insert(payload);
    setOpen(false);
    setForm({ title: "", description: "", sponsor_id: "", status: "todo", due_date: "", assigned_to: "", benefit_name: "", sponsor_category: "" });
    setLoading(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary">
        <Plus size={16} />
        Novi zadatak
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-enter">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-display text-xl font-bold text-gray-900">Novi zadatak</h2>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Naslov *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field"
              placeholder="Opis zadatka..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Opis</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field resize-none"
              rows={2}
              placeholder="Više detalja..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Sponzor</label>
              <select
                value={form.sponsor_id}
                onChange={(e) => setForm({ ...form, sponsor_id: e.target.value })}
                className="input-field"
              >
                <option value="">— Bez sponzora —</option>
                {sponsors.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="input-field"
              >
                <option value="todo">Za napraviti</option>
                <option value="in_progress">U tijeku</option>
                <option value="done">Završeno</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Rok</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Dodijeljeno</label>
              <input
                type="text"
                value={form.assigned_to}
                onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                className="input-field"
                placeholder="Marcel, Dino..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Benefit</label>
              <select
                value={form.benefit_name}
                onChange={(e) => setForm({ ...form, benefit_name: e.target.value })}
                className="input-field"
              >
                <option value="">— Bez benefita —</option>
                {benefitNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategorija sponzorstva</label>
              <select
                value={form.sponsor_category}
                onChange={(e) => setForm({ ...form, sponsor_category: e.target.value })}
                className="input-field"
              >
                <option value="">— Bez kategorije —</option>
                {SPONSOR_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1 justify-center">
              Odustani
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <><Loader2 size={14} className="animate-spin" /> Dodaje...</> : "Dodaj zadatak"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
