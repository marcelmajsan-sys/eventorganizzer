"use client";

import { useState } from "react";
import { X, Calendar, Tag, ExternalLink } from "lucide-react";
import Link from "next/link";

const MONTHS = [
  "Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj",
  "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"
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

const TYPE_LABEL: Record<string, string> = {
  deadline: "Rok isporuke",
  milestone: "Prekretnica",
  conference: "Konferencija",
  payment: "Plaćanje",
  benefit: "Rok isporuke",
};

const TYPE_BADGE: Record<string, string> = {
  deadline: "bg-orange-100 text-orange-700 border-orange-200",
  milestone: "bg-blue-100 text-blue-700 border-blue-200",
  conference: "bg-purple-100 text-purple-700 border-purple-200",
  payment: "bg-green-100 text-green-700 border-green-200",
  benefit: "bg-orange-100 text-orange-700 border-orange-200",
};

interface StaticEvent {
  kind: "static";
  day: number;
  month: number;
  title: string;
  type: string;
  href: string;
}

interface BenefitEvent {
  kind: "benefit";
  id: string;
  day: number;
  month: number;
  title: string;
  sponsorName: string | null;
  sponsorId: string | null;
}

type CalendarEvent = StaticEvent | BenefitEvent;

interface Props {
  staticEvents: Omit<StaticEvent, "kind">[];
  benefits: { id: string; deadline: string; benefit_name: string; sponsor_id: string | null; sponsors: { name: string } | null }[];
  currentMonth: number;
}

export default function CalendarView({ staticEvents, benefits, currentMonth }: Props) {
  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  const benefitsByMonth: Record<number, BenefitEvent[]> = {};
  benefits.forEach((b) => {
    const month = new Date(b.deadline).getMonth();
    const day = new Date(b.deadline).getDate();
    if (!benefitsByMonth[month]) benefitsByMonth[month] = [];
    benefitsByMonth[month]!.push({
      kind: "benefit",
      id: b.id,
      day,
      month,
      title: b.benefit_name,
      sponsorName: b.sponsors?.name ?? null,
      sponsorId: b.sponsor_id,
    });
  });

  function formatFullDate(day: number, month: number) {
    return `${day}. ${MONTHS[month]}`;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {MONTHS.map((month, idx) => {
          const monthEvents = staticEvents.filter((e) => e.month === idx);
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
                  <button
                    key={i}
                    onClick={() => setSelected({ kind: "static", ...event })}
                    className={`w-full text-left flex items-start gap-2 p-2 rounded-lg border text-xs hover:opacity-80 transition-opacity ${EVENT_COLORS[event.type]}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full mt-0.5 flex-shrink-0 ${EVENT_DOTS[event.type]}`} />
                    <div>
                      <span className="font-medium">{event.day}.</span> {event.title}
                    </div>
                  </button>
                ))}

                {monthBenefits.map((benefit) => (
                  <button
                    key={benefit.id}
                    onClick={() => setSelected(benefit)}
                    className="w-full text-left flex items-start gap-2 p-2 rounded-lg border text-xs bg-orange-50 border-orange-100 text-orange-700 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-1.5 h-1.5 rounded-full mt-0.5 flex-shrink-0 bg-orange-400" />
                    <div>
                      <span className="font-medium">{benefit.day}.</span>{" "}
                      {benefit.sponsorName && <span className="text-orange-500">[{benefit.sponsorName}]</span>}{" "}
                      {benefit.title}
                    </div>
                  </button>
                ))}

                {monthEvents.length === 0 && monthBenefits.length === 0 && (
                  <p className="text-xs text-gray-300 text-center py-3">—</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Event detail modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-24"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-enter"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <span className={`badge border text-xs ${TYPE_BADGE[selected.kind === "benefit" ? "benefit" : selected.type]}`}>
                {TYPE_LABEL[selected.kind === "benefit" ? "benefit" : selected.type]}
              </span>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <p className="text-lg font-bold text-gray-900 leading-snug">
                  {selected.kind === "benefit" && selected.sponsorName
                    ? `[${selected.sponsorName}] ${selected.title}`
                    : selected.title}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={15} className="text-gray-400" />
                <span>{formatFullDate(selected.day, selected.month)}</span>
              </div>

              {selected.kind === "benefit" && selected.sponsorName && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Tag size={15} className="text-gray-400" />
                  {selected.sponsorId ? (
                    <Link
                      href={`/admin/sponsors/${selected.sponsorId}`}
                      className="text-brand-600 hover:text-brand-700 hover:underline font-medium"
                      onClick={() => setSelected(null)}
                    >
                      {selected.sponsorName}
                    </Link>
                  ) : (
                    <span>{selected.sponsorName}</span>
                  )}
                </div>
              )}

              {selected.kind === "static" && (
                <Link
                  href={selected.href}
                  className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium"
                  onClick={() => setSelected(null)}
                >
                  <ExternalLink size={14} />
                  Otvori sekciju
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
