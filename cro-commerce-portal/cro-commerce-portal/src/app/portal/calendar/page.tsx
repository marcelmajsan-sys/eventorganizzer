import { createAdminClient, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Calendar, CheckCircle2, Clock, Circle, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";

const statusIcon: Record<string, React.ReactNode> = {
  done: <CheckCircle2 size={13} className="text-emerald-500" />,
  in_progress: <Clock size={13} className="text-blue-500" />,
  todo: <Circle size={13} className="text-gray-400" />,
};

const MONTHS = ["Siječanj","Veljača","Ožujak","Travanj","Svibanj","Lipanj",
  "Srpanj","Kolovoz","Rujan","Listopad","Studeni","Prosinac"];

export default async function PortalCalendarPage() {
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
    .select("id, title, status, due_date, assigned_to")
    .eq("sponsor_id", sponsorUser.sponsor_id)
    .not("due_date", "is", null)
    .order("due_date");

  const rows = tasks ?? [];

  // Grupiraj po mjesecu
  const byMonth: Record<string, typeof rows> = {};
  rows.forEach((t) => {
    const d = new Date(t.due_date!);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key]!.push(t);
  });

  const monthKeys = Object.keys(byMonth).sort();

  return (
    <div className="animate-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Rokovnik</h1>
          <p className="page-subtitle">Pregled zadataka po rokovima</p>
        </div>
      </div>

      {monthKeys.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Nema zadataka s rokovima</p>
        </div>
      ) : (
        <div className="space-y-6">
          {monthKeys.map((key) => {
            const [year, month] = key.split("-");
            const monthName = MONTHS[parseInt(month!) - 1];
            const monthTasks = byMonth[key]!;
            return (
              <div key={key}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Calendar size={14} />
                  {monthName} {year}
                </h2>
                <div className="space-y-2">
                  {monthTasks.map((task) => {
                    const isOverdue = new Date(task.due_date!) < new Date() && task.status !== "done";
                    return (
                      <div key={task.id} className={`card p-3.5 flex items-center gap-3 ${isOverdue ? "border-red-200 bg-red-50/30" : ""}`}>
                        <span className="flex-shrink-0">{statusIcon[task.status] ?? statusIcon.todo}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                          {task.assigned_to && (
                            <p className="text-xs text-gray-500 mt-0.5">{task.assigned_to}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isOverdue && <AlertTriangle size={13} className="text-red-500" />}
                          <span className={`text-xs ${isOverdue ? "text-red-600 font-medium" : "text-gray-500"}`}>
                            {formatDate(task.due_date!)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
