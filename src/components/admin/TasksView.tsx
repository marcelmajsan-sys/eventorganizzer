"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import KanbanBoard from "@/components/admin/KanbanBoard";
import AddTaskModal from "@/components/admin/AddTaskModal";
import type { Task, TaskStatus } from "@/types";

interface Props {
  initialTasks: (Task & { sponsors?: any })[];
}

function emailLabel(email: string) {
  // "marcel.majsan@gmail.com" → "marcel.majsan"
  return email.split("@")[0];
}

export default function TasksView({ initialTasks }: Props) {
  const [tasks, setTasks] = useState(initialTasks);
  const [filterBy, setFilterBy] = useState<string | null>(null);
  const supabase = createClient();

  // Admini koji imaju barem jedan aktivan (ne-done) zadatak
  const activeAssignees: string[] = [];
  const seen = new Set<string>();
  tasks.forEach((t) => {
    if (t.assigned_to && t.status !== "done" && !seen.has(t.assigned_to)) {
      seen.add(t.assigned_to);
      activeAssignees.push(t.assigned_to);
    }
  });
  activeAssignees.sort();

  // Ako filterBy više nije u listi (npr. sve zadatke završio), resetiraj filter
  const resolvedFilter =
    filterBy && seen.has(filterBy) ? filterBy : null;

  const visibleTasks = resolvedFilter
    ? tasks.filter((t) => t.assigned_to === resolvedFilter)
    : tasks;

  function handleAdded(task: Task & { sponsors?: any }) {
    setTasks((prev) => [task, ...prev]);
  }

  async function handleStatusChange(taskId: string, newStatus: TaskStatus) {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId);
  }

  return (
    <>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Zadaci</h1>
          <p className="page-subtitle">Kanban pregled svih zadataka</p>
        </div>
        <AddTaskModal onAdded={handleAdded} />
      </div>

      {/* Filter po odgovornoj osobi */}
      {activeAssignees.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          <button
            onClick={() => setFilterBy(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              resolvedFilter === null
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-brand-400 hover:text-brand-600"
            }`}
          >
            Svi
          </button>
          {activeAssignees.map((email) => (
            <button
              key={email}
              onClick={() => setFilterBy(email === resolvedFilter ? null : email)}
              title={email}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                resolvedFilter === email
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-brand-400 hover:text-brand-600"
              }`}
            >
              {emailLabel(email)}
            </button>
          ))}
        </div>
      )}

      <KanbanBoard tasks={visibleTasks} onStatusChange={handleStatusChange} />
    </>
  );
}
