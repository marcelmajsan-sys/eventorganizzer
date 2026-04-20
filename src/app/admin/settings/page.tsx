import { cookies } from "next/headers";
import { Settings } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import { PROJECT_COOKIE, PROJECTS, resolveProjectId } from "@/lib/supabase/projects";
import type { ProjectId } from "@/lib/supabase/projects";
import ProjectSettingsForm from "@/components/admin/ProjectSettingsForm";
import UserManagementSection from "@/components/admin/UserManagementSection";
import PartnerManagementSection from "@/components/admin/PartnerManagementSection";
import { listUsersWithMeta } from "@/app/actions/userManagement";
import type { PartnerUser } from "@/app/actions/partnerManagement";

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
  try { users = await listUsersWithMeta(); } catch {}

  // Partneri — queryja oba projekta i deduplikuje po emailu
  let partners: PartnerUser[] = [];
  let sponsors: { id: string; name: string }[] = [];
  try {
    const projectsToQuery: ProjectId[] = ["2026", "2025"];
    const seenEmails = new Set<string>();

    for (const pid of projectsToQuery) {
      // Preskoči duplikat ako oba projekta koriste isti Supabase URL
      if (pid !== projectId && PROJECTS[pid].url === PROJECTS[projectId].url) continue;

      const pidAdmin = createAdminClientForProject(pid);
      const [sponsorUsersRes, sponsorsRes, authRes] = await Promise.all([
        pidAdmin.from("sponsor_users").select("id, user_id, sponsor_id").order("created_at"),
        pidAdmin.from("sponsors").select("id, name").order("name"),
        pidAdmin.auth.admin.listUsers({ perPage: 1000 }),
      ]);

      const pidSponsors = sponsorsRes.data ?? [];
      const pidSponsorUsers = sponsorUsersRes.data ?? [];
      const pidAuthUsers = authRes.data?.users ?? [];
      const pidSponsorsMap = Object.fromEntries(pidSponsors.map((s) => [s.id, s.name]));

      if (pid === projectId) sponsors = pidSponsors;

      for (const su of pidSponsorUsers) {
        const authUser = pidAuthUsers.find((u) => u.id === su.user_id);
        const email = authUser?.email ?? su.user_id;
        if (seenEmails.has(email)) continue;
        seenEmails.add(email);
        partners.push({
          id: su.id,
          user_id: su.user_id,
          sponsor_id: su.sponsor_id,
          sponsor_name: pidSponsorsMap[su.sponsor_id] ?? "—",
          email,
          name: (authUser?.user_metadata?.name as string | null) ?? null,
        });
      }
    }
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
        <PartnerManagementSection partners={partners} sponsors={sponsors} />
      </div>
    </div>
  );
}
