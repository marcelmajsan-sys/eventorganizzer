import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import { PROJECTS, PROJECT_COOKIE, resolveProjectId } from "@/lib/supabase/projects";
import type { ProjectId } from "@/lib/supabase/projects";
import PortalSidebar from "@/components/portal/PortalSidebar";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const projectId = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);
  const otherProjectId: ProjectId = projectId === "2026" ? "2025" : "2026";

  // SSR klijent za bilo koji projekt — čita browser cookie sesije
  const makeAnonClient = (pid: ProjectId) =>
    createServerClient(PROJECTS[pid].url, PROJECTS[pid].anonKey, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs) => {
          try { cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    });

  // Pronađi valjanu sesiju — probaj aktivni projekt, pa drugi
  let user: { id: string; email?: string } | null = null;
  for (const pid of [projectId, otherProjectId] as ProjectId[]) {
    const { data: { user: u } } = await makeAnonClient(pid).auth.getUser();
    if (u) { user = u; break; }
  }

  if (!user) redirect("/login");

  const activeAdmin = createAdminClientForProject(projectId);

  // Admin ide na admin panel
  const { data: adminRow } = await activeAdmin
    .from("project_admins")
    .select("email")
    .eq("email", user.email ?? "")
    .maybeSingle();
  if (adminRow) redirect("/admin/dashboard");

  // UUID korisnika je različit između projekata — traži ga u aktivnom projektu po emailu
  const { data: authList } = await activeAdmin.auth.admin.listUsers({ perPage: 1000 });
  const activeAuthUser = authList?.users?.find(
    (u) => u.email?.toLowerCase() === (user!.email ?? "").toLowerCase()
  );

  if (!activeAuthUser) {
    // Korisnik nema račun u aktivnom projektu — odjavi i vrati na login
    await makeAnonClient(projectId).auth.signOut();
    redirect("/login?error=no_access");
  }

  // Provjeri sponsor_users s ispravnim UUID-om aktivnog projekta
  const { data: sponsorUser } = await activeAdmin
    .from("sponsor_users")
    .select("sponsor_id, sponsors(id, name, package_type)")
    .eq("user_id", activeAuthUser.id)
    .maybeSingle();

  if (!sponsorUser) {
    await makeAnonClient(projectId).auth.signOut();
    redirect("/login?error=no_access");
  }

  const sponsorsRaw = sponsorUser.sponsors as unknown;
  const sponsor = (Array.isArray(sponsorsRaw) ? sponsorsRaw[0] : sponsorsRaw) as {
    id: string; name: string; package_type: string;
  };

  // Provjeri postoji li isti user i u drugom projektu (za switcher)
  let otherProjectAvailable = false;
  try {
    const otherAdmin = createAdminClientForProject(otherProjectId);
    const { data: otherAuthList } = await otherAdmin.auth.admin.listUsers({ perPage: 1000 });
    const otherAuthUser = otherAuthList?.users?.find(
      (u) => u.email?.toLowerCase() === (user!.email ?? "").toLowerCase()
    );
    if (otherAuthUser) {
      const { data: otherSU } = await otherAdmin
        .from("sponsor_users")
        .select("id")
        .eq("user_id", otherAuthUser.id)
        .maybeSingle();
      otherProjectAvailable = !!otherSU;
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
