import { cookies } from "next/headers";
import { resolveProjectId, PROJECT_COOKIE } from "@/lib/supabase/projects";
import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import PortalProgramView from "@/components/portal/PortalProgramView";
import PortalPageHeader from "@/components/portal/PortalPageHeader";

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
      <PortalPageHeader titleKey="program.title" subtitleKey="program.subtitle" />

      <PortalProgramView sessions={sessions ?? []} />
    </div>
  );
}
