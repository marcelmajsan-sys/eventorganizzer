import { createClient } from "@/lib/supabase/server";
import TasksView from "@/components/admin/TasksView";

export default async function TasksPage() {
  const supabase = await createClient();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, sponsors(name, package_type)")
    .order("created_at", { ascending: false });

  return (
    <div className="animate-enter">
      <TasksView initialTasks={tasks ?? []} />
    </div>
  );
}
