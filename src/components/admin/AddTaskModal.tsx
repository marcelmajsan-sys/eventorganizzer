"use client";

import { useState, useEffect } from "react";
import { Plus, X, Loader2, ChevronDown } from "lucide-react";
import { createTask } from "@/app/actions/tasks";
import { getAdminEmails } from "@/app/actions/getAdminEmails";
import type { Task } from "@/types";

interface Props {
  onAdded?: (task: Task & { sponsors?: any }) => void;
}

export default function AddTaskModal({ onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminEmails, setAdminEmails] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "todo",
    due_date: "",
    assigned_to: "",
  });

  useEffect(() => {
    if (open && adminEmails.length === 0) {
      getAdminEmails().then(setAdminEmails);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await createTask(form);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.data && onAdded) {
      onAdded(result.data as Task & { sponsors?: any });
    }

    setOpen(false);
    setForm({ title: "", description: "", status: "todo", due_date: "", assigned_to: "" });
    setLoading(false);
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-enter">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-display text-xl font-bold text-gray-900">Novi zadatak</h2>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Naziv *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field"
              placeholder="Naziv zadatka..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Opis</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field resize-none"
              rows={3}
              placeholder="Opis zadatka..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Odgovorna osoba
            </label>
            {adminEmails.length > 0 ? (
              <div className="relative">
                <select
                  value={form.assigned_to}
                  onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                  className="input-field appearance-none pr-8"
                >
                  <option value="">— Nije dodijeljena —</option>
                  {adminEmails.map((email) => (
                    <option key={email} value={email}>{email}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            ) : (
              <input
                type="email"
                value={form.assigned_to}
                onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                className="input-field"
                placeholder="korisnik@ecommerce.hr"
              />
            )}
            <p className="text-xs text-gray-400 mt-1">
              Admin korisnici dobivaju obavijest u inbox pri dodjeli zadatka.
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1 justify-center">
              Odustani
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <><Loader2 size={14} className="animate-spin" /> Dodaje...</> : <><Plus size={14} /> Dodaj zadatak</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
