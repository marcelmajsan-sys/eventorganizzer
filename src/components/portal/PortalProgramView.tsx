"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

type Stage = "future" | "action" | "wonderland" | "all";
type SessionType = "talk" | "panel" | "fireside" | "keynote" | "break" | "networking";

interface Session {
  id: string;
  time_start: string;
  time_end: string;
  stage: Stage;
  speaker_name: string | null;
  topic: string;
  session_type: SessionType;
}

const STAGE_TABS = [
  { id: "sve",        label: "Sve" },
  { id: "future",     label: "Future Stage" },
  { id: "action",     label: "Action Stage" },
  { id: "wonderland", label: "Wonderland Stage" },
] as const;

type StageTab = typeof STAGE_TABS[number]["id"];

const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  talk:       "Predavanje",
  panel:      "Panel",
  fireside:   "Fireside",
  keynote:    "Keynote",
  break:      "Pauza",
  networking: "Networking",
};

function typeStyle(type: SessionType) {
  switch (type) {
    case "talk":       return "bg-blue-50 text-blue-700 border-blue-200";
    case "panel":      return "bg-orange-50 text-orange-700 border-orange-200";
    case "fireside":   return "bg-rose-50 text-rose-700 border-rose-200";
    case "keynote":    return "bg-amber-50 text-amber-700 border-amber-200";
    case "break":      return "bg-gray-100 text-gray-500 border-gray-200";
    case "networking": return "bg-teal-50 text-teal-700 border-teal-200";
  }
}

function stageStyle(stage: Stage) {
  switch (stage) {
    case "future":     return "bg-brand-100 text-brand-700";
    case "action":     return "bg-emerald-100 text-emerald-700";
    case "wonderland": return "bg-violet-100 text-violet-700";
    case "all":        return "bg-gray-100 text-gray-600";
  }
}

function stageLabel(stage: Stage) {
  return STAGE_TABS.find(s => s.id === stage)?.label ?? stage;
}

export default function PortalProgramView({ sessions }: { sessions: Session[] }) {
  const [activeTab, setActiveTab] = useState<StageTab>("sve");
  const [query, setQuery] = useState("");

  const q = query.toLowerCase();
  const filtered = sessions
    .filter(s => activeTab === "sve" || s.stage === activeTab || s.stage === "all")
    .filter(s => !q || s.topic.toLowerCase().includes(q) || (s.speaker_name ?? "").toLowerCase().includes(q));

  const timeMap = new Map<string, Session[]>();
  for (const s of filtered) {
    const key = `${s.time_start}|${s.time_end}`;
    if (!timeMap.has(key)) timeMap.set(key, []);
    timeMap.get(key)!.push(s);
  }
  const groups = Array.from(timeMap.entries())
    .map(([key, items]) => ({ key, items }))
    .sort((a, b) => a.key.localeCompare(b.key));

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {STAGE_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Traži govornika ili temu..."
            className="input-field pl-8 text-sm py-2 w-full"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Timeline */}
      {groups.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-400 text-sm">
            {query ? "Nema rezultata za traženi pojam." : "Program još nije objavljen."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map(({ key, items }) => {
            const [timeStart, timeEnd] = key.split("|");
            const isAllStage = items.every(s => s.session_type === "break" || s.session_type === "networking");

            return (
              <div key={key} className={`card overflow-hidden ${isAllStage ? "opacity-80" : ""}`}>
                <div className={`px-4 py-2 border-b border-gray-100 flex items-center gap-2 ${isAllStage ? "bg-gray-50" : "bg-white"}`}>
                  <span className="text-sm font-bold text-gray-800 tabular-nums">{timeStart}</span>
                  <span className="text-gray-300 text-xs">—</span>
                  <span className="text-sm text-gray-400 tabular-nums">{timeEnd}</span>
                  {items.length > 1 && (
                    <span className="ml-2 text-xs text-gray-400">{items.length} paralelne sesije</span>
                  )}
                </div>

                <div
                  className={items.length > 1 ? "grid divide-x divide-gray-100" : ""}
                  style={items.length > 1 ? { gridTemplateColumns: `repeat(${items.length}, 1fr)` } : {}}
                >
                  {items.map(session => (
                    <div key={session.id} className="flex items-start gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${typeStyle(session.session_type)}`}>
                            {SESSION_TYPE_LABELS[session.session_type]}
                          </span>
                          {activeTab === "sve" && session.stage !== "all" && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${stageStyle(session.stage)}`}>
                              {stageLabel(session.stage)}
                            </span>
                          )}
                        </div>
                        {session.speaker_name && (
                          <p className="text-sm font-semibold text-gray-900 leading-tight">{session.speaker_name}</p>
                        )}
                        <p className={`text-sm leading-tight ${session.speaker_name ? "text-gray-600" : "font-medium text-gray-800"}`}>
                          {session.topic}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
