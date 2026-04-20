import { createAdminClient, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock, Circle, Calendar, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

const statusConfig = {
  done: { icon: <CheckCircle2 size={15} className="text-emerald-500" />, label: "Završeno", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  in_progress: { icon: <Clock size={15} className="text-blue-500" />, label: "U tijeku", color: "bg-blue-50 text-blue-700 border-blue-200" },
  todo: { icon: <Circle size={15} className="text-gray-400" />, label: "Na čekanju", color: "bg-gray-50 text-gray-600 border-gray-200" },
};

export default async function PortalTasksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const adminClient = await createAdminClient();
  const { data: sponsorUser } = await adminClient
    .from("sponsor_users")
    .select("sponsor_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!sponsorUser) redirect("/login");

  const { data: tasks } = await adminClient
    .from("tasks")
    .select("id, title, description, status, due_date, assigned_to")
    .eq("sponsor_id", sponsorUser.sponsor_id)
    .order("due_date");

  const rows = tasks ?? [];

  return (
    <div className="animate-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Zadaci</h1>
          <p className="page-subtitle">Zadaci vezani za vaše sponzorstvo</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="card p-12 text-center">
          <CheckCircle2 size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Nema zadataka</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((task) => {
            const cfg = statusConfig[task.status as keyof typeof statusConfig] ?? statusConfig.todo;
            const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "done";
            return (
              <div key={task.id} className={`card p-4 flex items-start gap-4 ${isOverdue ? "border-red-200" : ""}`}>
                <span className="mt-0.5 flex-shrink-0">{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                  {task.description && (
                    <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {task.due_date && (
                      <span className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-600 font-medium" : "text-gray-500"}`}>
                        <Calendar size={11} />
                        {formatDate(task.due_date)}
                        {isOverdue && " • Rok prošao"}
                      </span>
                    )}
                    {task.assigned_to && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <User size={11} />
                        {task.assigned_to}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`badge text-xs border flex-shrink-0 ${cfg.color}`}>
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
