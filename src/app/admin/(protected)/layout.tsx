import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
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

  if (!user) redirect("/admin");

  const cookieStore = await cookies();
  const activeProject = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);
  const project = PROJECTS[activeProject];

  let adminEmails = FALLBACK_ADMIN_EMAILS;
  let conferenceDate = project.conferenceDate;
  let conferenceDates: Record<"2026" | "2025", string> = {
    "2026": PROJECTS["2026"].conferenceDate,
    "2025": PROJECTS["2025"].conferenceDate,
  };
  let unreadCount = 0;

  try {
    // Direktan service-role klijent (bypassira RLS pouzdano) — createAdminClient()
    // preko @supabase/ssr prati user session i degradira u authenticated role,
    // pa RLS na project_admins blokira SELECT i novi admini se ne vide.
    const projectClient = createAdminClientForProject(activeProject);
    const [adminsRes, settingsRes, totalRes, readRes] = await Promise.all([
      projectClient.from("project_admins").select("email"),
      projectClient.from("project_settings").select("key, value"),
      projectClient.from("notifications").select("*", { count: "exact", head: true }),
      projectClient.from("notification_reads").select("*", { count: "exact", head: true }).eq("user_id", user.id),
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
    unreadCount = Math.max(0, (totalRes.count ?? 0) - (readRes.count ?? 0));
  } catch {
    // Tables not yet created — use hardcoded fallbacks
  }

  const userEmailLower = (user.email ?? "").toLowerCase();
  const isAdmin = adminEmails.some((e) => e.toLowerCase() === userEmailLower);
  if (!isAdmin) redirect("/portal");

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar
        userEmail={user.email ?? ""}
        activeProject={activeProject}
        conferenceDate={conferenceDate}
        conferenceDates={conferenceDates}
        unreadCount={unreadCount}
      />
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
