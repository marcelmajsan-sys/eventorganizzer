import { createClient } from "@/lib/supabase/server";
import KanbanBoard from "@/components/admin/KanbanBoard";
import AddTaskModal from "@/components/admin/AddTaskModal";

export default async function TasksPage() {
  const supabase = await createClient();

  const [{ data: tasks }, { data: sponsors }, { data: benefits }] = await Promise.all([
    supabase
      .from("tasks")
      .select("*, sponsors(name, package_type)")
      .order("created_at", { ascending: false }),
    supabase.from("sponsors").select("id, name").order("name"),
    supabase.from("sponsor_benefits").select("benefit_name").order("benefit_name"),
  ]);

  const uniqueBenefitNames = Array.from(new Set((benefits ?? []).map((b) => b.benefit_name))).sort();

  return (
    <div className="animate-enter">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Zadaci</h1>
          <p className="page-subtitle">Kanban pregled svih zadataka</p>
        </div>
        <AddTaskModal sponsors={sponsors ?? []} benefitNames={uniqueBenefitNames} />
      </div>

      <KanbanBoard initialTasks={tasks ?? []} />
    </div>
  );
}
