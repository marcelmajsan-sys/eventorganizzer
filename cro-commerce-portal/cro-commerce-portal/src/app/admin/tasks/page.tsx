import { createClient } from "@/lib/supabase/server";
import KanbanBoard from "@/components/admin/KanbanBoard";
import AddTaskModal from "@/components/admin/AddTaskModal";

export default async function TasksPage() {
  const supabase = await createClient();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, sponsors(name, package_type)")
    .order("created_at", { ascending: false });

  return (
    <div className="animate-enter">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Zadaci</h1>
          <p className="page-subtitle">Kanban pregled svih zadataka</p>
        </div>
        <AddTaskModal />
      </div>

      <KanbanBoard initialTasks={tasks ?? []} />
    </div>
  );
}
