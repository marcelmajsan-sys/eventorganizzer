import { cookies } from "next/headers";
import { Settings } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import { PROJECT_COOKIE, PROJECTS, resolveProjectId } from "@/lib/supabase/projects";
import ProjectSettingsForm from "@/components/admin/ProjectSettingsForm";
import UserManagementSection from "@/components/admin/UserManagementSection";
import { listUsersWithMeta } from "@/app/actions/userManagement";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const projectId = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);
  const project = PROJECTS[projectId];
  const supabase = await createAdminClient();

  const settingsRes = await supabase.from("project_settings").select("key, value");

  const conferenceDate =
    settingsRes.data?.find((s) => s.key === `conference_date_${projectId}`)?.value ??
    project.conferenceDate;

  let users: { email: string; name: string | null; id2026: string | null; id2025: string | null }[] = [];
  try {
    users = await listUsersWithMeta();
  } catch {}

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
          <Settings size={20} className="text-brand-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Postavke projekta</h1>
          <p className="text-gray-500 text-sm">{project.label}</p>
        </div>
      </div>

      <div className="space-y-6">
        <ProjectSettingsForm
          conferenceDate={conferenceDate}
          projectLabel={project.label}
        />

        <UserManagementSection users={users} />
      </div>
    </div>
  );
}
