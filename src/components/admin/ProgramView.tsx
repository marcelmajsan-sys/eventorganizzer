"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, X, Check, Loader2 } from "lucide-react";

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
  sort_order: number;
}

const STAGE_TABS = [
  { id: "sve",        label: "Sve" },
  { id: "future",     label: "Future Stage" },
  { id: "action",     label: "Action Stage" },
  { id: "wonderland", label: "Wonderland Stage" },
] as const;

type StageTab = typeof STAGE_TABS[number]["id"];

const SESSION_TYPE_OPTIONS: { value: SessionType; label: string }[] = [
  { value: "talk",        label: "Predavanje" },
  { value: "panel",       label: "Panel" },
  { value: "fireside",    label: "Fireside" },
  { value: "keynote",     label: "Keynote" },
  { value: "break",       label: "Pauza" },
  { value: "networking",  label: "Networking" },
];

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

function typeLabel(type: SessionType) {
  return SESSION_TYPE_OPTIONS.find(t => t.value === type)?.label ?? type;
}

const emptyForm = {
  time_start:   "",
  time_end:     "",
  stage:        "future" as Stage,
  speaker_name: "",
  topic:        "",
  session_type: "talk" as SessionType,
};

interface Props {
  sessions: Session[];
}

export default function ProgramView({ sessions: initial }: Props) {
  const [sessions, setSessions]       = useState(initial);
  const [activeTab, setActiveTab]     = useState<StageTab>("sve");
  const [showModal, setShowModal]     = useState(false);
  const [editing, setEditing]         = useState<Session | null>(null);
  const [form, setForm]               = useState(emptyForm);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState("");
  const [confirmDel, setConfirmDel]   = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => { setSessions(initial); }, [initial]);

  const filtered = activeTab === "sve"
    ? sessions
    : sessions.filter(s => s.stage === activeTab || s.stage === "all");

  // Group by time slot
  const timeMap = new Map<string, Session[]>();
  for (const s of filtered) {
    const key = `${s.time_start}|${s.time_end}`;
    if (!timeMap.has(key)) timeMap.set(key, []);
    timeMap.get(key)!.push(s);
  }
  const groups = Array.from(timeMap.entries())
    .map(([key, items]) => ({ key, items }))
    .sort((a, b) => a.key.localeCompare(b.key));

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  }

  function openEdit(s: Session) {
    setEditing(s);
    setForm({
      time_start:   s.time_start,
      time_end:     s.time_end,
      stage:        s.stage,
      speaker_name: s.speaker_name ?? "",
      topic:        s.topic,
      session_type: s.session_type,
    });
    setError("");
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const payload = {
      time_start:   form.time_start,
      time_end:     form.time_end,
      stage:        form.stage,
      speaker_name: form.speaker_name || null,
      topic:        form.topic,
      session_type: form.session_type,
    };

    if (editing) {
      const { error: err } = await supabase.from("program_sessions").update(payload).eq("id", editing.id);
      setSaving(false);
      if (err) { setError(err.message); return; }
      setSessions(prev =>
        prev.map(s => s.id === editing.id ? { ...s, ...payload } : s)
            .sort((a, b) => a.time_start.localeCompare(b.time_start))
      );
    } else {
      const { data, error: err } = await supabase
        .from("program_sessions")
        .insert({ ...payload, sort_order: 0 })
        .select()
        .single();
      setSaving(false);
      if (err) { setError(err.message); return; }
      if (data) {
        setSessions(prev =>
          [...prev, data as Session].sort((a, b) => a.time_start.localeCompare(b.time_start))
        );
      }
    }
    setShowModal(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await supabase.from("program_sessions").delete().eq("id", id);
    setSessions(prev => prev.filter(s => s.id !== id));
    setConfirmDel(null);
  }

  const canSave = form.topic.trim() && form.time_start && form.time_end && !saving;

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
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
        <button onClick={openAdd} className="btn-primary">
          <Plus size={15} /> Dodaj sesiju
        </button>
      </div>

      {/* Timeline */}
      {groups.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-400 text-sm">Nema sesija. Dodaj prvu sesiju klikom na gumb iznad.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map(({ key, items }) => {
            const [timeStart, timeEnd] = key.split("|");
            const isAllStage = items.every(s => s.session_type === "break" || s.session_type === "networking");

            return (
              <div key={key} className={`card overflow-hidden ${isAllStage ? "opacity-80" : ""}`}>
                {/* Time header */}
                <div className={`px-4 py-2 border-b border-gray-100 flex items-center gap-2 ${isAllStage ? "bg-gray-50" : "bg-white"}`}>
                  <span className="text-sm font-bold text-gray-800 tabular-nums">{timeStart}</span>
                  <span className="text-gray-300 text-xs">—</span>
                  <span className="text-sm text-gray-400 tabular-nums">{timeEnd}</span>
                  {items.length > 1 && (
                    <span className="ml-2 text-xs text-gray-400">{items.length} paralelne sesije</span>
                  )}
                </div>

                {/* Sessions */}
                <div className={items.length > 1 ? "grid divide-x divide-gray-100" : ""} style={items.length > 1 ? { gridTemplateColumns: `repeat(${items.length}, 1fr)` } : {}}>
                  {items.map(session => (
                    <div
                      key={session.id}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${typeStyle(session.session_type)}`}>
                            {typeLabel(session.session_type)}
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

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pt-0.5">
                        <button onClick={() => openEdit(session)} className="p-1 text-gray-400 hover:text-brand-600 transition-colors">
                          <Pencil size={13} />
                        </button>
                        {confirmDel === session.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(session.id)} className="text-xs px-1.5 py-0.5 bg-red-600 text-white rounded hover:bg-red-700">Da</button>
                            <button onClick={() => setConfirmDel(null)} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">Ne</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDel(session.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-enter">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 text-base">
                {editing ? "Uredi sesiju" : "Dodaj sesiju"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Početak *</label>
                  <input
                    value={form.time_start}
                    onChange={e => setForm({ ...form, time_start: e.target.value })}
                    className="input-field text-sm"
                    placeholder="09:15"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Kraj *</label>
                  <input
                    value={form.time_end}
                    onChange={e => setForm({ ...form, time_end: e.target.value })}
                    className="input-field text-sm"
                    placeholder="09:45"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Pozornica *</label>
                  <select
                    value={form.stage}
                    onChange={e => setForm({ ...form, stage: e.target.value as Stage })}
                    className="input-field text-sm"
                  >
                    <option value="future">Future Stage</option>
                    <option value="action">Action Stage</option>
                    <option value="wonderland">Wonderland Stage</option>
                    <option value="all">Sve pozornice</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Tip *</label>
                  <select
                    value={form.session_type}
                    onChange={e => setForm({ ...form, session_type: e.target.value as SessionType })}
                    className="input-field text-sm"
                  >
                    {SESSION_TYPE_OPTIONS.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Govornik</label>
                <input
                  value={form.speaker_name}
                  onChange={e => setForm({ ...form, speaker_name: e.target.value })}
                  className="input-field text-sm"
                  placeholder="Ime i prezime (opcijalno)"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Tema / Naziv sesije *</label>
                <input
                  value={form.topic}
                  onChange={e => setForm({ ...form, topic: e.target.value })}
                  className="input-field text-sm"
                  placeholder="Naslov predavanja ili sesije"
                  autoFocus={!editing}
                />
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="btn-secondary text-sm py-2">
                Odustani
              </button>
              <button onClick={handleSave} disabled={!canSave} className="btn-primary text-sm py-2">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {editing ? "Spremi" : "Dodaj"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
