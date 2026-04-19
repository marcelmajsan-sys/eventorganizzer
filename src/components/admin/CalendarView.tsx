"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Calendar, User, Tag, ExternalLink, CheckCircle2, Clock, Circle, Pencil, Save, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const MONTHS = [
  "Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj",
  "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"
];

const STATUS_ICON: Record<string, React.ReactNode> = {
  todo: <Circle size={13} className="text-gray-400" />,
  in_progress: <Clock size={13} className="text-blue-500" />,
  done: <CheckCircle2 size={13} className="text-emerald-500" />,
};

const STATUS_LABEL: Record<string, string> = {
  todo: "Za napraviti",
  in_progress: "U tijeku",
  done: "Završeno",
};

const STATUS_COLOR: Record<string, string> = {
  todo: "bg-gray-50 border-gray-200 text-gray-700",
  in_progress: "bg-blue-50 border-blue-100 text-blue-700",
  done: "bg-emerald-50 border-emerald-100 text-emerald-700",
};

interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  assigned_to: string | null;
  status: string;
  sponsor_id: string | null;
  sponsors: { id: string; name: string } | null;
}

interface SelectedTask extends Task {
  day: number;
  month: number;
}

interface Props {
  tasks: Task[];
  currentMonth: number;
}

export default function CalendarView({ tasks, currentMonth }: Props) {
  const [selected, setSelected] = useState<SelectedTask | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", due_date: "", status: "", assigned_to: "" });
  const router = useRouter();
  const supabase = createClient();

  const tasksByMonth: Record<number, (Task & { day: number })[]> = {};
  tasks.forEach((t) => {
    const d = new Date(t.due_date);
    const month = d.getMonth();
    const day = d.getDate();
    if (!tasksByMonth[month]) tasksByMonth[month] = [];
    tasksByMonth[month]!.push({ ...t, day });
  });

  function openTask(task: Task & { day: number }, monthIdx: number) {
    setSelected({ ...task, month: monthIdx });
    setEditing(false);
    setForm({
      title: task.title,
      description: task.description ?? "",
      due_date: task.due_date.substring(0, 10),
      status: task.status,
      assigned_to: task.assigned_to ?? "",
    });
  }

  function closeModal() {
    setSelected(null);
    setEditing(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    await supabase.from("tasks").update({
      title: form.title,
      description: form.description || null,
      due_date: form.due_date || null,
      status: form.status,
      assigned_to: form.assigned_to || null,
    }).eq("id", selected.id);
    setLoading(false);
    setEditing(false);
    closeModal();
    router.refresh();
  }

  async function handleDelete() {
    if (!selected) return;
    if (!confirm(`Obriši zadatak "${selected.title}"?`)) return;
    await supabase.from("tasks").delete().eq("id", selected.id);
    closeModal();
    router.refresh();
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {MONTHS.map((month, idx) => {
          const monthTasks = tasksByMonth[idx] ?? [];
          const isCurrentMonth = idx === currentMonth;

          return (
            <div key={month} className={`card p-4 ${isCurrentMonth ? "ring-2 ring-brand-500 ring-offset-1" : ""}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-semibold ${isCurrentMonth ? "text-brand-700" : "text-gray-900"}`}>
                  {month}
                  {isCurrentMonth && (
                    <span className="ml-2 text-xs font-normal text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">Ovaj mjesec</span>
                  )}
                </h3>
                {monthTasks.length > 0 && (
                  <span className="text-xs text-gray-400">{monthTasks.length} zadataka</span>
                )}
              </div>

              <div className="space-y-1.5">
                {monthTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => openTask(task, idx)}
                    className={`w-full text-left flex items-start gap-2 p-2 rounded-lg border text-xs hover:opacity-80 transition-opacity ${STATUS_COLOR[task.status] ?? "bg-gray-50 border-gray-200 text-gray-700"}`}
                  >
                    <div className="mt-0.5 flex-shrink-0">{STATUS_ICON[task.status]}</div>
                    <span>
                      <span className="font-medium">{task.day}.</span>{" "}
                      {task.sponsors && <span className="opacity-70">[{task.sponsors.name}]</span>}{" "}
                      {task.title}
                    </span>
                  </button>
                ))}

                {monthTasks.length === 0 && (
                  <p className="text-xs text-gray-300 text-center py-3">—</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-16" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-enter" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <span className="badge bg-orange-100 text-orange-700 border-orange-200 text-xs">Zadatak</span>
              <div className="flex items-center gap-3">
                {!editing && (
                  <>
                    <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600 transition-colors">
                      <Pencil size={13} /> Uredi
                    </button>
                    <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Detail view */}
            {!editing && (
              <div className="p-5 space-y-4">
                <p className="text-lg font-bold text-gray-900 leading-snug">{selected.title}</p>

                {selected.description && (
                  <p className="text-sm text-gray-500 whitespace-pre-wrap leading-relaxed">{selected.description}</p>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Rok</p>
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <Calendar size={13} className="text-gray-400" />
                      {selected.day}. {MONTHS[selected.month]}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Status</p>
                    <div className="flex items-center gap-1.5 text-gray-700">
                      {STATUS_ICON[selected.status]}
                      {STATUS_LABEL[selected.status]}
                    </div>
                  </div>
                  {selected.assigned_to && (
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Odgovorna osoba</p>
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <User size={13} className="text-gray-400" />
                        {selected.assigned_to}
                      </div>
                    </div>
                  )}
                  {selected.sponsors && (
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Sponzor</p>
                      <div className="flex items-center gap-1.5">
                        <Tag size={13} className="text-gray-400" />
                        <Link href={`/admin/sponsors/${selected.sponsors.id}`} className="text-brand-600 hover:underline font-medium text-sm" onClick={closeModal}>
                          {selected.sponsors.name}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <Link href={`/admin/tasks/${selected.id}`} className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium" onClick={closeModal}>
                    <ExternalLink size={14} />
                    Otvori zadatak
                  </Link>
                </div>
              </div>
            )}

            {/* Edit form */}
            {editing && (
              <form onSubmit={handleSave} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Naziv *</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Opis</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field text-sm resize-none" rows={3} placeholder="Opis zadatka..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Rok</label>
                    <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field text-sm">
                      <option value="todo">Za napraviti</option>
                      <option value="in_progress">U tijeku</option>
                      <option value="done">Završeno</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Odgovorna osoba</label>
                  <input type="text" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} className="input-field text-sm" placeholder="Marcel, Dino..." />
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setEditing(false)} className="btn-secondary flex-1 justify-center text-sm">Odustani</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center text-sm">
                    {loading ? <><Loader2 size={13} className="animate-spin" /> Sprema...</> : <><Save size={13} /> Spremi</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
