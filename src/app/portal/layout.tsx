import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import { PROJECTS, PROJECT_COOKIE, resolveProjectId } from "@/lib/supabase/projects";
import type { ProjectId } from "@/lib/supabase/projects";
import PortalSidebar from "@/components/portal/PortalSidebar";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const projectId = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const adminClient = await createAdminClient();

  // Admin ide na admin panel
  const { data: adminRow } = await adminClient
    .from("project_admins")
    .select("email")
    .eq("email", user.email ?? "")
    .maybeSingle();

  if (adminRow) redirect("/admin/dashboard");

  // Provjeri je li sponzor u aktivnom projektu
  const { data: sponsorUser } = await adminClient
    .from("sponsor_users")
    .select("sponsor_id, sponsors(id, name, package_type)")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!sponsorUser) {
    await supabase.auth.signOut();
    redirect("/login?error=no_access");
  }

  const sponsorsRaw = sponsorUser.sponsors as unknown;
  const sponsor = (Array.isArray(sponsorsRaw) ? sponsorsRaw[0] : sponsorsRaw) as { id: string; name: string; package_type: string };

  // Provjeri postoji li isti korisnik i u drugom projektu
  const otherProjectId: ProjectId = projectId === "2026" ? "2025" : "2026";
  let otherProjectAvailable = false;
  try {
    if (PROJECTS[otherProjectId].url !== PROJECTS[projectId].url) {
      const otherAdmin = createAdminClientForProject(otherProjectId);
      const { data: otherAuthData } = await otherAdmin.auth.admin.listUsers({ perPage: 1000 });
      const otherAuthUser = otherAuthData?.users?.find(
        (u) => u.email?.toLowerCase() === user.email?.toLowerCase()
      );
      if (otherAuthUser) {
        const { data: otherSU } = await otherAdmin
          .from("sponsor_users")
          .select("id")
          .eq("user_id", otherAuthUser.id)
          .maybeSingle();
        otherProjectAvailable = !!otherSU;
      }
    }
  } catch {}

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <PortalSidebar
        sponsor={sponsor}
        userEmail={user.email ?? ""}
        activeProjectId={projectId}
        otherProjectId={otherProjectAvailable ? otherProjectId : undefined}
      />
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="p-4 md:p-8 max-w-[1200px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
