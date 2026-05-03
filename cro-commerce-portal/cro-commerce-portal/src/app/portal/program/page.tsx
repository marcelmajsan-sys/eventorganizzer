import { cookies } from "next/headers";
import { resolveProjectId, PROJECT_COOKIE } from "@/lib/supabase/projects";
import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import PortalProgramView from "@/components/portal/PortalProgramView";
import { CalendarDays } from "lucide-react";

export default async function PortalProgramPage() {
  const cookieStore = await cookies();
  const projectId = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);
  const adminClient = createAdminClientForProject(projectId);

  const { data: sessions } = await adminClient
    .from("program_sessions")
    .select("id, time_start, time_end, stage, speaker_name, topic, session_type, sort_order")
    .eq("project_id", projectId)
    .order("time_start")
    .order("sort_order");

  return (
    <div className="animate-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Program konferencije</h1>
          <p className="page-subtitle">Raspored sesija i govornika</p>
        </div>
      </div>

      {sessions && sessions.length > 0 ? (
        <PortalProgramView sessions={sessions} />
      ) : (
        <div className="card p-16 text-center">
          <CalendarDays size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Program još nije objavljen.</p>
        </div>
      )}
    </div>
  );
}
