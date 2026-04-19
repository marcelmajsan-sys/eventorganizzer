import { createClient } from "@/lib/supabase/server";
import CalendarView from "@/components/admin/CalendarView";

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, description, due_date, assigned_to, status, sponsor_id, sponsors(id, name)")
    .not("due_date", "is", null)
    .order("due_date");

  const currentMonth = new Date().getMonth();

  return (
    <div className="animate-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Rokovnik</h1>
          <p className="page-subtitle">Niže se prikazuju rokovi za sve zadatke po svim mjesecima u godini.</p>
        </div>
      </div>

      <CalendarView
        tasks={(tasks ?? []) as any}
        currentMonth={currentMonth}
      />
    </div>
  );
}
