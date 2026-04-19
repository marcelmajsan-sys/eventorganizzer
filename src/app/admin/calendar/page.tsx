import { createClient } from "@/lib/supabase/server";
import { AlertCircle } from "lucide-react";
import CalendarView from "@/components/admin/CalendarView";

const EVENT_DOTS: Record<string, string> = {
  deadline: "bg-orange-500",
  milestone: "bg-blue-500",
  conference: "bg-purple-600",
  payment: "bg-green-500",
};

const CONFERENCE_EVENTS = [
  { month: 0, day: 15, title: "Rok: Logo u visokoj rezoluciji", type: "deadline", href: "/admin/benefits" },
  { month: 1, day: 1, title: "Potvrda sponzorskih paketa", type: "milestone", href: "/admin/sponsors" },
  { month: 1, day: 28, title: "Rok: Materijali za goodie bag", type: "deadline", href: "/admin/benefits" },
  { month: 2, day: 15, title: "Rok: Oglasi za magazin", type: "deadline", href: "/admin/benefits" },
  { month: 2, day: 31, title: "Otvaranje registracije posjetitelja", type: "milestone", href: "/admin/dashboard" },
  { month: 3, day: 10, title: "Rok: Workshop opisi i govornici", type: "deadline", href: "/admin/benefits" },
  { month: 3, day: 20, title: "Tisak magazina", type: "milestone", href: "/admin/dashboard" },
  { month: 4, day: 1, title: "Rok: Prezentacije za glavnu pozornicu", type: "deadline", href: "/admin/benefits" },
  { month: 4, day: 15, title: "Probna postavka štandova", type: "milestone", href: "/admin/dashboard" },
  { month: 5, day: 10, title: "🎯 CRO Commerce 2025 — Dan 1", type: "conference", href: "/admin/program" },
  { month: 5, day: 11, title: "🎯 CRO Commerce 2025 — Dan 2", type: "conference", href: "/admin/program" },
  { month: 6, day: 1, title: "Post-event izvještaj sponzorima", type: "milestone", href: "/admin/sponsors" },
  { month: 6, day: 31, title: "Rok plaćanja — drugi obrok", type: "payment", href: "/admin/troskovi" },
  { month: 7, day: 31, title: "Rok plaćanja — treći obrok", type: "payment", href: "/admin/troskovi" },
  { month: 8, day: 1, title: "Početak prikupljanja sponzora 2026", type: "milestone", href: "/admin/sponsors" },
];

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

      {/* Legend */}
      <div className="card p-4 mb-6 flex flex-wrap gap-4">
        {Object.entries(EVENT_DOTS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2 text-sm text-gray-600">
            <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
            <span>
              {type === "deadline" ? "Rok isporuke" :
               type === "milestone" ? "Prekretnica" :
               type === "conference" ? "Konferencija" : "Plaćanje"}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2 text-sm text-gray-600 ml-auto">
          <AlertCircle size={14} className="text-orange-500" />
          <span>Zadaci iz baze prikazani narančasto</span>
        </div>
      </div>

      <CalendarView
        staticEvents={CONFERENCE_EVENTS}
        tasks={(tasks ?? []) as any}
        currentMonth={currentMonth}
      />
    </div>
  );
}
