import { cookies } from "next/headers";
import { Settings } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import { PROJECT_COOKIE, PROJECTS, resolveProjectId } from "@/lib/supabase/projects";
import ProjectSettingsForm from "@/components/admin/ProjectSettingsForm";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const projectId = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);
  const project = PROJECTS[projectId];
  const supabase = await createAdminClient();

  const [settingsRes, adminsRes] = await Promise.all([
    supabase.from("project_settings").select("key, value"),
    supabase.from("project_admins").select("email").order("email"),
  ]);

  const conferenceDate =
    settingsRes.data?.find((s) => s.key === `conference_date_${projectId}`)?.value ??
    project.conferenceDate;

  const admins = adminsRes.data?.map((a) => a.email) ?? [];
  const migrationNeeded = !!(settingsRes.error || adminsRes.error);

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

      {migrationNeeded && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-amber-800 font-medium text-sm mb-1">
            Baza podataka nije pripremljena za ovu funkciju.
          </p>
          <p className="text-amber-700 text-sm">
            Pokrenite <code className="bg-amber-100 px-1 rounded font-mono">migration_005_project_settings.sql</code> u Supabase SQL Editoru za ovaj projekt.
          </p>
        </div>
      )}

      <ProjectSettingsForm
        conferenceDate={conferenceDate}
        admins={admins}
        projectLabel={project.label}
      />
    </div>
  );
}
