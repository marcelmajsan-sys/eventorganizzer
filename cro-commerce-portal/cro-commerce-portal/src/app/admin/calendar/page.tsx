import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { CalendarDays, AlertCircle } from "lucide-react";

const MONTHS = [
  "Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj",
  "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"
];

const CONFERENCE_EVENTS = [
  { month: 0, day: 15, title: "Rok: Logo u visokoj rezoluciji", type: "deadline" },
  { month: 1, day: 1, title: "Potvrda sponzorskih paketa", type: "milestone" },
  { month: 1, day: 28, title: "Rok: Materijali za goodie bag", type: "deadline" },
  { month: 2, day: 15, title: "Rok: Oglasi za magazin", type: "deadline" },
  { month: 2, day: 31, title: "Otvaranje registracije posjetitelja", type: "milestone" },
  { month: 3, day: 10, title: "Rok: Workshop opisi i govornici", type: "deadline" },
  { month: 3, day: 20, title: "Tisak magazina", type: "milestone" },
  { month: 4, day: 1, title: "Rok: Prezentacije za glavnu pozornicu", type: "deadline" },
  { month: 4, day: 15, title: "Probna postavka štandova", type: "milestone" },
  { month: 5, day: 10, title: "🎯 CRO Commerce 2025 — Dan 1", type: "conference" },
  { month: 5, day: 11, title: "🎯 CRO Commerce 2025 — Dan 2", type: "conference" },
  { month: 6, day: 1, title: "Post-event izvještaj sponzorima", type: "milestone" },
  { month: 6, day: 31, title: "Rok plaćanja — drugi obrok", type: "payment" },
  { month: 7, day: 31, title: "Rok plaćanja — treći obrok", type: "payment" },
  { month: 8, day: 1, title: "Početak prikupljanja sponzora 2026", type: "milestone" },
];

const EVENT_COLORS: Record<string, string> = {
  deadline: "bg-orange-100 border-orange-200 text-orange-800",
  milestone: "bg-blue-100 border-blue-200 text-blue-800",
  conference: "bg-purple-100 border-purple-300 text-purple-900 font-semibold",
  payment: "bg-green-100 border-green-200 text-green-800",
};

const EVENT_DOTS: Record<string, string> = {
  deadline: "bg-orange-500",
  milestone: "bg-blue-500",
  conference: "bg-purple-600",
  payment: "bg-green-500",
};

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: benefits } = await supabase
    .from("sponsor_benefits")
    .select("*, sponsors(name)")
    .gte("deadline", new Date().toISOString())
    .order("deadline");

  // Group benefits by month
  const benefitsByMonth: Record<number, typeof benefits> = {};
  benefits?.forEach((b) => {
    const month = new Date(b.deadline).getMonth();
    if (!benefitsByMonth[month]) benefitsByMonth[month] = [];
    benefitsByMonth[month]!.push(b);
  });

  const currentMonth = new Date().getMonth();

  return (
    <div className="animate-enter">
      <div className="page-header">
        <h1 className="page-title">Kalendar aktivnosti</h1>
        <p className="page-subtitle">Godišnji plan CRO Commerce 2025</p>
      </div>

      {/* Legend */}
      <div className="card p-4 mb-6 flex flex-wrap gap-4">
        {Object.entries(EVENT_DOTS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2 text-sm text-gray-600">
            <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
            <span className="capitalize">
              {type === "deadline" ? "Rok isporuke" :
               type === "milestone" ? "Prekretnica" :
               type === "conference" ? "Konferencija" : "Plaćanje"}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2 text-sm text-gray-600 ml-auto">
          <AlertCircle size={14} className="text-orange-500" />
          <span>Rokovi iz baze su prikazani narančasto</span>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {MONTHS.map((month, idx) => {
          const monthEvents = CONFERENCE_EVENTS.filter((e) => e.month === idx);
          const monthBenefits = benefitsByMonth[idx] ?? [];
          const isCurrentMonth = idx === currentMonth;

          return (
            <div
              key={month}
              className={`card p-4 ${isCurrentMonth ? "ring-2 ring-brand-500 ring-offset-1" : ""}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-semibold ${isCurrentMonth ? "text-brand-700" : "text-gray-900"}`}>
                  {month}
                  {isCurrentMonth && (
                    <span className="ml-2 text-xs font-normal text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                      Ovaj mjesec
                    </span>
                  )}
                </h3>
                {(monthEvents.length > 0 || monthBenefits.length > 0) && (
                  <span className="text-xs text-gray-400">
                    {monthEvents.length + monthBenefits.length} eventi
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                {monthEvents.map((event, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 p-2 rounded-lg border text-xs ${EVENT_COLORS[event.type]}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full mt-0.5 flex-shrink-0 ${EVENT_DOTS[event.type]}`} />
                    <div>
                      <span className="font-medium">{event.day}.</span> {event.title}
                    </div>
                  </div>
                ))}

                {monthBenefits.map((benefit) => (
                  <div
                    key={benefit.id}
                    className="flex items-start gap-2 p-2 rounded-lg border text-xs bg-orange-50 border-orange-100 text-orange-700"
                  >
                    <div className="w-1.5 h-1.5 rounded-full mt-0.5 flex-shrink-0 bg-orange-400" />
                    <div>
                      <span className="font-medium">{new Date(benefit.deadline).getDate()}.</span>{" "}
                      <span className="text-orange-500">[{benefit.sponsors?.name}]</span>{" "}
                      {benefit.benefit_name}
                    </div>
                  </div>
                ))}

                {monthEvents.length === 0 && monthBenefits.length === 0 && (
                  <p className="text-xs text-gray-300 text-center py-3">—</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
