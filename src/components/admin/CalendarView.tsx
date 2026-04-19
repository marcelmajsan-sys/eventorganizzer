"use client";

import { useState } from "react";
import { X, Calendar, User, Tag, ExternalLink, CheckCircle2, Clock, Circle } from "lucide-react";
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
};

const TYPE_BADGE: Record<string, string> = {
  deadline: "bg-orange-100 text-orange-700 border-orange-200",
  milestone: "bg-blue-100 text-blue-700 border-blue-200",
  conference: "bg-purple-100 text-purple-700 border-purple-200",
  payment: "bg-green-100 text-green-700 border-green-200",
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  todo: <Circle size={13} className="text-gray-400" />,
  in_progress: <Clock size={13} className="text-blue-500" />,
  done: <CheckCircle2 size={13} className="text-emerald-500" />,
};

const STATUS_LABEL: Record<string, string> = {
  todo: "Za napraviti",
  in_progress: "U tijeku",
  done: "Završeno",
};

interface StaticEvent {
  month: number;
  day: number;
  title: string;
  type: string;
  href: string;
}

interface TaskEvent {
  id: string;
  title: string;
  due_date: string;
  assigned_to: string | null;
  status: string;
  sponsor_id: string | null;
  sponsors: { id: string; name: string } | null;
}

interface SelectedStatic extends StaticEvent { kind: "static" }
interface SelectedTask extends TaskEvent { kind: "task"; day: number; month: number }
type Selected = SelectedStatic | SelectedTask;

interface Props {
  staticEvents: StaticEvent[];
  tasks: TaskEvent[];
  currentMonth: number;
}

export default function CalendarView({ staticEvents, tasks, currentMonth }: Props) {
  const [selected, setSelected] = useState<Selected | null>(null);

  const tasksByMonth: Record<number, (TaskEvent & { day: number })[]> = {};
  tasks.forEach((t) => {
    const d = new Date(t.due_date);
    const month = d.getMonth();
    const day = d.getDate();
    if (!tasksByMonth[month]) tasksByMonth[month] = [];
    tasksByMonth[month]!.push({ ...t, day });
  });

  function formatFullDate(day: number, month: number) {
    return `${day}. ${MONTHS[month]}`;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {MONTHS.map((month, idx) => {
          const monthEvents = staticEvents.filter((e) => e.month === idx);
          const monthTasks = tasksByMonth[idx] ?? [];
          const isCurrentMonth = idx === currentMonth;
          const total = monthEvents.length + monthTasks.length;

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
                {total > 0 && (
                  <span className="text-xs text-gray-400">{total} eventi</span>
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
                    <span><span className="font-medium">{event.day}.</span> {event.title}</span>
                  </button>
                ))}

                {monthTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => setSelected({ kind: "task", ...task, month: idx })}
                    className="w-full text-left flex items-start gap-2 p-2 rounded-lg border text-xs bg-orange-50 border-orange-100 text-orange-700 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-1.5 h-1.5 rounded-full mt-0.5 flex-shrink-0 bg-orange-400" />
                    <span>
                      <span className="font-medium">{task.day}.</span>{" "}
                      {task.sponsors && <span className="text-orange-500">[{task.sponsors.name}]</span>}{" "}
                      {task.title}
                    </span>
                  </button>
                ))}

                {total === 0 && (
                  <p className="text-xs text-gray-300 text-center py-3">—</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

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
              <span className={`badge border text-xs ${selected.kind === "static" ? TYPE_BADGE[selected.type] : "bg-orange-100 text-orange-700 border-orange-200"}`}>
                {selected.kind === "static" ? TYPE_LABEL[selected.type] : "Zadatak"}
              </span>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-lg font-bold text-gray-900 leading-snug">{selected.title}</p>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={15} className="text-gray-400" />
                <span>{formatFullDate(selected.day, selected.kind === "task" ? selected.month : selected.month)}</span>
              </div>

              {selected.kind === "task" && selected.assigned_to && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User size={15} className="text-gray-400" />
                  <span>{selected.assigned_to}</span>
                </div>
              )}

              {selected.kind === "task" && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {STATUS_ICON[selected.status]}
                  <span>{STATUS_LABEL[selected.status] ?? selected.status}</span>
                </div>
              )}

              {selected.kind === "task" && selected.sponsors && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Tag size={15} className="text-gray-400" />
                  <Link
                    href={`/admin/sponsors/${selected.sponsors.id}`}
                    className="text-brand-600 hover:text-brand-700 hover:underline font-medium"
                    onClick={() => setSelected(null)}
                  >
                    {selected.sponsors.name}
                  </Link>
                </div>
              )}

              {selected.kind === "task" && (
                <Link
                  href={`/admin/tasks/${selected.id}`}
                  className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium"
                  onClick={() => setSelected(null)}
                >
                  <ExternalLink size={14} />
                  Otvori zadatak
                </Link>
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
