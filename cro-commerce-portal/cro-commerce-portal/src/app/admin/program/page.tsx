import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { PROJECT_COOKIE, resolveProjectId } from "@/lib/supabase/projects";
import ProgramView from "@/components/admin/ProgramView";

export default async function ProgramPage() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const projectId = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);

  let sessions: any[] = [];
  try {
    const { data } = await supabase
      .from("program_sessions")
      .select("*")
      .eq("project_id", projectId)
      .order("time_start")
      .order("sort_order");
    sessions = data ?? [];
  } catch {
    // Table not yet created — show empty state
  }

  return (
    <div className="animate-enter">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Program</h1>
          <p className="page-subtitle">Raspored sesija i predavača po pozornicama</p>
        </div>
      </div>
      <ProgramView sessions={sessions} projectId={projectId} />
    </div>
  );
}
