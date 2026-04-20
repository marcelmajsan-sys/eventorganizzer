import { cookies } from "next/headers";
import { Settings } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import { PROJECT_COOKIE, PROJECTS, resolveProjectId } from "@/lib/supabase/projects";
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

  // Partneri — inline fetch bez "use server" konteksta
  let partners: PartnerUser[] = [];
  let sponsors: { id: string; name: string }[] = [];
  try {
    const [sponsorUsersRes, sponsorsRes] = await Promise.all([
      supabase.from("sponsor_users").select("id, user_id, sponsor_id").order("created_at"),
      supabase.from("sponsors").select("id, name").order("name"),
    ]);

    sponsors = sponsorsRes.data ?? [];
    const sponsorsMap = Object.fromEntries(sponsors.map((s) => [s.id, s.name]));
    const sponsorUsers = sponsorUsersRes.data ?? [];

    if (sponsorUsers.length > 0) {
      const admin2026 = createAdminClientForProject("2026");
      const admin2025 = createAdminClientForProject("2025");
      const [res2026, res2025] = await Promise.all([
        admin2026.auth.admin.listUsers({ perPage: 1000 }),
        admin2025.auth.admin.listUsers({ perPage: 1000 }),
      ]);
      const authUsers = [
        ...(res2026.data?.users ?? []),
        ...(res2025.data?.users ?? []),
      ];

      partners = sponsorUsers.map((su) => {
        const authUser = authUsers.find((u) => u.id === su.user_id);
        return {
          id: su.id,
          user_id: su.user_id,
          sponsor_id: su.sponsor_id,
          sponsor_name: sponsorsMap[su.sponsor_id] ?? "—",
          email: authUser?.email ?? su.user_id,
          name: (authUser?.user_metadata?.name as string | null) ?? null,
        };
      });
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
