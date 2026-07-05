import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import { PROJECT_COOKIE, resolveProjectId, type ProjectId } from "@/lib/supabase/projects";

// Jedina zajednička lista fallback admina — ne duplicirati po datotekama.
export const FALLBACK_ADMIN_EMAILS = [
  "marcel@ecommerce.hr",
  "udruga@ecommerce.hr",
  "laura@ecommerce.hr",
];

export const SUPER_ADMIN_EMAIL = "marcel@ecommerce.hr";

export type AdminAuth =
  | { ok: true; user: { id: string; email: string }; projectId: ProjectId }
  | { ok: false; error: string };

export type SponsorAuth =
  | { ok: true; user: { id: string; email: string }; sponsorId: string; projectId: ProjectId }
  | { ok: false; error: string };

async function getSessionUser() {
  const cookieStore = await cookies();
  const projectId = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { user, projectId };
}

/**
 * Guard za admin server actione i API rute. Server actioni su javno pozivljivi
 * POST endpointi, a admin klijenti bypassiraju RLS — svaki admin action MORA
 * početi ovom provjerom.
 */
export async function requireAdmin(): Promise<AdminAuth> {
  const { user, projectId } = await getSessionUser();
  if (!user?.email) return { ok: false, error: "Niste prijavljeni." };

  const email = user.email.toLowerCase();
  if (FALLBACK_ADMIN_EMAILS.includes(email)) {
    return { ok: true, user: { id: user.id, email }, projectId };
  }

  const admin = createAdminClientForProject(projectId);
  const { data } = await admin.from("project_admins").select("email");
  const isAdmin = (data ?? []).some(
    (r: { email: string | null }) => r.email?.toLowerCase() === email
  );
  if (!isAdmin) return { ok: false, error: "Nemate administratorska prava." };

  return { ok: true, user: { id: user.id, email }, projectId };
}

/**
 * Guard za partner/portal server actione. Provjerava da je pozivatelj mapiran
 * u sponsor_users; ako je proslijeđen expectedSponsorId, provjerava i da mu
 * taj sponzor stvarno pripada.
 */
export async function requireSponsor(expectedSponsorId?: string): Promise<SponsorAuth> {
  const { user, projectId } = await getSessionUser();
  if (!user?.email) return { ok: false, error: "Niste prijavljeni." };

  const admin = createAdminClientForProject(projectId);
  const { data: rows } = await admin
    .from("sponsor_users")
    .select("sponsor_id")
    .eq("user_id", user.id);

  const sponsorIds = (rows ?? []).map((r: { sponsor_id: string }) => r.sponsor_id);
  if (sponsorIds.length === 0) return { ok: false, error: "Nemate pristup portalu." };
  if (expectedSponsorId && !sponsorIds.includes(expectedSponsorId)) {
    return { ok: false, error: "Nemate pristup ovom partneru." };
  }

  return {
    ok: true,
    user: { id: user.id, email: user.email.toLowerCase() },
    sponsorId: expectedSponsorId ?? sponsorIds[0],
    projectId,
  };
}

/** Guard koji propušta i admina i vlasnika sponzora (npr. updatePrimaryContact). */
export async function requireAdminOrSponsor(sponsorId: string): Promise<
  | { ok: true; role: "admin" | "sponsor"; projectId: ProjectId }
  | { ok: false; error: string }
> {
  const adminAuth = await requireAdmin();
  if (adminAuth.ok) return { ok: true, role: "admin", projectId: adminAuth.projectId };

  const sponsorAuth = await requireSponsor(sponsorId);
  if (sponsorAuth.ok) return { ok: true, role: "sponsor", projectId: sponsorAuth.projectId };

  return { ok: false, error: "Nemate pristup." };
}
