import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { PROJECT_COOKIE, resolveProjectId, PROJECTS } from "@/lib/supabase/projects";

const FALLBACK_ADMIN_EMAILS = [
  "marcel@ecommerce.hr",
  "udruga@ecommerce.hr",
  "laura@ecommerce.hr",
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const cookieStore = await cookies();
  const activeProject = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);
  const project = PROJECTS[activeProject];

  let adminEmails = FALLBACK_ADMIN_EMAILS;
  let conferenceDate = project.conferenceDate;
  let conferenceDates: Record<"2026" | "2025", string> = {
    "2026": PROJECTS["2026"].conferenceDate,
    "2025": PROJECTS["2025"].conferenceDate,
  };

  try {
    const adminClient = await createAdminClient();
    const [adminsRes, settingsRes] = await Promise.all([
      adminClient.from("project_admins").select("email"),
      adminClient.from("project_settings").select("key, value"),
    ]);
    if (adminsRes.data && adminsRes.data.length > 0) {
      adminEmails = adminsRes.data.map((r) => r.email);
    }
    const dbDate = settingsRes.data?.find((s) => s.key === `conference_date_${activeProject}`)?.value;
    if (dbDate) conferenceDate = dbDate;
    conferenceDates = {
      "2026": settingsRes.data?.find((s) => s.key === "conference_date_2026")?.value ?? PROJECTS["2026"].conferenceDate,
      "2025": settingsRes.data?.find((s) => s.key === "conference_date_2025")?.value ?? PROJECTS["2025"].conferenceDate,
    };
  } catch {
    // Tables not yet created — use hardcoded fallbacks
  }

  if (!adminEmails.includes(user.email ?? "")) redirect("/login");

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar
        userEmail={user.email ?? ""}
        activeProject={activeProject}
        conferenceDate={conferenceDate}
        conferenceDates={conferenceDates}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
