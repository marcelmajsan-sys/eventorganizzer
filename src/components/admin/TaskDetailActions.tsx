"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Pencil, X, Loader2, Save, Trash2 } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
}

export default function TaskDetailActions({ task }: { task: Task }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    due_date: task.due_date ? task.due_date.substring(0, 10) : "",
    assigned_to: task.assigned_to ?? "",
  });
  const router = useRouter();
  const supabase = createClient();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await supabase.from("tasks").update({
      title: form.title,
      description: form.description || null,
      status: form.status,
      due_date: form.due_date || null,
      assigned_to: form.assigned_to || null,
    }).eq("id", task.id);
    setLoading(false);
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Obriši zadatak "${task.title}"?`)) return;
    await supabase.from("tasks").delete().eq("id", task.id);
    router.push("/admin/tasks");
  }

  if (!editing) {
    return (
      <div className="flex gap-2">
        <button onClick={() => setEditing(true)} className="btn-secondary">
          <Pencil size={14} />
          Uredi
        </button>
        <button onClick={handleDelete} className="btn-secondary text-red-600 hover:bg-red-50 hover:border-red-200">
          <Trash2 size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-enter">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-display text-xl font-bold text-gray-900">Uredi zadatak</h2>
          <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Naslov *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Opis</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
              <option value="todo">Za napraviti</option>
              <option value="in_progress">U tijeku</option>
              <option value="done">Završeno</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Rok</label>
              <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Dodijeljeno</label>
              <input type="text" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} className="input-field" placeholder="Marcel, Dino..." />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setEditing(false)} className="btn-secondary flex-1 justify-center">Odustani</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <><Loader2 size={14} className="animate-spin" /> Sprema...</> : <><Save size={14} /> Spremi</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
