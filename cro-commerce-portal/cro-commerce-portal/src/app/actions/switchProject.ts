"use server";

import { cookies } from "next/headers";
import { PROJECT_COOKIE, resolveProjectId, type ProjectId } from "@/lib/supabase/projects";
import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";

const FALLBACK_ADMIN_EMAILS = [
  "marcel@ecommerce.hr",
  "udruga@ecommerce.hr",
  "laura@ecommerce.hr",
];

export async function switchProject(projectId: ProjectId): Promise<"dashboard" | "login"> {
  const cookieStore = await cookies();
  const currentProjectId = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);

  const { createServerClient } = await import("@supabase/ssr");
  const { PROJECTS: PROJ } = await import("@/lib/supabase/projects");

  // Get current user from the CURRENT project's Supabase instance
  const currentClient = createServerClient(PROJ[currentProjectId].url, PROJ[currentProjectId].anonKey, {
    cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
  });
  const { data: { user } } = await currentClient.auth.getUser();
  if (!user?.email) return "login";

  // Check access in target project
  const targetAdmin = createAdminClientForProject(projectId);
  const { data: adminRow } = await targetAdmin
    .from("project_admins")
    .select("email")
    .eq("email", user.email)
    .maybeSingle();

  const hasAccess = adminRow !== null || FALLBACK_ADMIN_EMAILS.includes(user.email);
  if (!hasAccess) return "login";

  // Token exchange: generate magic link in target project and set session server-side
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://eventorganizzer.vercel.app";
  const { data: linkData, error: linkError } = await targetAdmin.auth.admin.generateLink({
    type: "magiclink",
    email: user.email,
    options: { redirectTo: `${appUrl}/auth/callback` },
  });

  if (!linkError && linkData?.properties?.action_link) {
    try {
      const resp = await fetch(linkData.properties.action_link, { redirect: "manual" });
      const location = resp.headers.get("location") ?? "";
      const hashStart = location.indexOf("#");
      if (hashStart !== -1) {
        const params = new URLSearchParams(location.substring(hashStart + 1));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        if (accessToken && refreshToken) {
          const targetClient = createServerClient(PROJ[projectId].url, PROJ[projectId].anonKey, {
            cookies: {
              getAll: () => cookieStore.getAll(),
              setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
            },
          });
          await targetClient.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        }
      }
    } catch {
      // Token exchange failed — proceed anyway (same-instance fallback)
    }
  }

  cookieStore.set(PROJECT_COOKIE, projectId, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  return "dashboard";
}

// Switches portal project fully server-side:
// generates magic link, fetches it server-side to get tokens, sets session via cookies.
// No browser magic link redirect needed.
export async function switchPortalProject(targetProjectId: ProjectId): Promise<boolean> {
  const cookieStore = await cookies();
  const currentProjectId = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);

  const { createServerClient } = await import("@supabase/ssr");
  const { PROJECTS: PROJ } = await import("@/lib/supabase/projects");

  const currentClient = createServerClient(PROJ[currentProjectId].url, PROJ[currentProjectId].anonKey, {
    cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
  });
  const { data: { user } } = await currentClient.auth.getUser();
  if (!user?.email) return false;

  const targetAdmin = createAdminClientForProject(targetProjectId);
  const { data: linkData, error: linkError } = await targetAdmin.auth.admin.generateLink({
    type: "magiclink",
    email: user.email,
    options: { redirectTo: "https://eventorganizzer.vercel.app/auth/callback" },
  });
  if (linkError || !linkData?.properties?.action_link) return false;

  // Fetch the verify URL server-side without following the redirect.
  // Supabase returns 302 with Location: redirectTo#access_token=...&refresh_token=...
  let resp: Response;
  try {
    resp = await fetch(linkData.properties.action_link, { redirect: "manual" });
  } catch {
    return false;
  }

  const location = resp.headers.get("location") ?? "";
  const hashStart = location.indexOf("#");
  if (hashStart === -1) return false;

  const params = new URLSearchParams(location.substring(hashStart + 1));
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (!accessToken || !refreshToken) return false;

  // Set the session server-side so SSR reads it immediately
  const targetClient = createServerClient(PROJ[targetProjectId].url, PROJ[targetProjectId].anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
    },
  });
  const { error: sessionError } = await targetClient.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (sessionError) return false;

  cookieStore.set(PROJECT_COOKIE, targetProjectId, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  return true;
}
