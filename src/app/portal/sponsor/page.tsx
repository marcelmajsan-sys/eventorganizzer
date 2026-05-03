import { createAdminClient, createClient } from "@/lib/supabase/server";
import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import { cookies } from "next/headers";
import { PROJECT_COOKIE, resolveProjectId } from "@/lib/supabase/projects";
import type { ProjectId } from "@/lib/supabase/projects";
import { redirect } from "next/navigation";
import PortalPartnerTabs from "@/components/portal/PortalPartnerTabs";

export default async function PortalSponsorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cookieStore = await cookies();
  const activeProjectId = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);
  const otherProjectId: ProjectId = activeProjectId === "2026" ? "2025" : "2026";

  const adminClient = await createAdminClient();
  const { data: sponsorUser } = await adminClient
    .from("sponsor_users")
    .select("sponsor_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!sponsorUser) redirect("/login");

  const [{ data: sponsor }, { data: contacts }, { data: activeFiles }] = await Promise.all([
    adminClient.from("sponsors").select("*").eq("id", sponsorUser.sponsor_id).single(),
    adminClient.from("sponsor_contacts").select("*").eq("sponsor_id", sponsorUser.sponsor_id).order("created_at"),
    adminClient.from("files").select("*").eq("sponsor_id", sponsorUser.sponsor_id).order("uploaded_at", { ascending: false }),
  ]);

  if (!sponsor) redirect("/login");

  // Dohvati datoteke i iz drugog projekta (admin možda uploadao tamo)
  let otherFiles: typeof activeFiles = [];
  try {
    const otherAdmin = createAdminClientForProject(otherProjectId);
    const { data: otherAuthList } = await otherAdmin.auth.admin.listUsers({ perPage: 1000 });
    const otherAuthUser = otherAuthList?.users?.find(
      (u) => u.email?.toLowerCase() === (user.email ?? "").toLowerCase()
    );
    if (otherAuthUser) {
      const { data: otherSU } = await otherAdmin
        .from("sponsor_users")
        .select("sponsor_id")
        .eq("user_id", otherAuthUser.id)
        .maybeSingle();
      if (otherSU) {
        const { data: fetchedFiles } = await otherAdmin
          .from("files")
          .select("*")
          .eq("sponsor_id", otherSU.sponsor_id)
          .order("uploaded_at", { ascending: false });
        otherFiles = fetchedFiles ?? [];
      }
    }
  } catch {}

  // Spoji i dedupliciraj po storage_url
  const seenUrls = new Set<string>();
  const allFiles = [...(activeFiles ?? []), ...(otherFiles ?? [])].filter((f) => {
    if (seenUrls.has(f.storage_url)) return false;
    seenUrls.add(f.storage_url);
    return true;
  });

  return (
    <div className="animate-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Moj partner</h1>
          <p className="page-subtitle">Informacije o vašem partnerstvu</p>
        </div>
      </div>

      <PortalPartnerTabs
        sponsor={sponsor}
        contacts={contacts ?? []}
        files={allFiles}
      />
    </div>
  );
}
