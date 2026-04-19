"use client";

import { useState } from "react";
import { ChevronDown, Check, FolderOpen, Loader2 } from "lucide-react";
import { switchProject } from "@/app/actions/switchProject";
import type { ProjectId } from "@/lib/supabase/projects";

const PROJECT_LABELS: Record<ProjectId, string> = {
  "2026": "CRO Commerce 2026",
  "2025": "CRO Commerce 2025",
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `Konf. ${d}.${m}.${y}.`;
}

interface Props {
  activeProject: ProjectId;
  conferenceDates: Record<ProjectId, string>;
}

export default function ProjectSwitcher({ activeProject, conferenceDates }: Props) {
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState<ProjectId | null>(null);

  const projects: { id: ProjectId; label: string; sub: string }[] = (
    ["2026", "2025"] as ProjectId[]
  ).map((id) => ({
    id,
    label: PROJECT_LABELS[id],
    sub: formatDate(conferenceDates[id]),
  }));

  const current = projects.find((p) => p.id === activeProject)!;

  async function handleSwitch(id: ProjectId) {
    if (id === activeProject || switching) { setOpen(false); return; }
    setSwitching(id);
    setOpen(false);
    try {
      await switchProject(id);
    } catch {
      // redirect() in Next.js throws — navigation is handled by the framework
    } finally {
      setSwitching(null);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-2.5 transition-colors text-left"
        disabled={!!switching}
      >
        {switching ? (
          <Loader2 size={14} className="text-brand-400 flex-shrink-0 animate-spin" />
        ) : (
          <FolderOpen size={14} className="text-brand-400 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-semibold truncate">{current.label}</p>
          <p className="text-gray-500 text-xs">{current.sub}</p>
        </div>
        <ChevronDown
          size={14}
          className={`text-gray-500 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute bottom-full left-0 right-0 mb-1 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-xl z-20"
            onClick={(e) => e.stopPropagation()}
          >
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSwitch(p.id)}
                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-700 transition-colors text-left disabled:opacity-50"
                disabled={!!switching}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{p.label}</p>
                  <p className="text-gray-500 text-xs">{p.sub}</p>
                </div>
                {p.id === activeProject && !switching && (
                  <Check size={13} className="text-brand-400 flex-shrink-0" />
                )}
                {switching === p.id && (
                  <Loader2 size={13} className="text-brand-400 flex-shrink-0 animate-spin" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
