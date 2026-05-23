"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import KanbanBoard from "@/components/admin/KanbanBoard";
import AddTaskModal from "@/components/admin/AddTaskModal";
import type { Task, TaskStatus } from "@/types";

interface Props {
  initialTasks: (Task & { sponsors?: any })[];
}

export default function TasksView({ initialTasks }: Props) {
  const [tasks, setTasks] = useState(initialTasks);
  const supabase = createClient();

  function handleAdded(task: Task & { sponsors?: any }) {
    setTasks((prev) => [task, ...prev]);
  }

  async function handleStatusChange(taskId: string, newStatus: TaskStatus) {
    // Optimistički update
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

      <KanbanBoard tasks={tasks} onStatusChange={handleStatusChange} />
    </>
  );
}
