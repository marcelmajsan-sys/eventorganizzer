import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { PROJECT_COOKIE, PROJECTS, resolveProjectId } from "./projects";

export async function createClient() {
  const cookieStore = await cookies();
  const projectId = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);
  const project = PROJECTS[projectId];

  return createServerClient(project.url, project.anonKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch { /* Server component - ignore */ }
      },
    },
  });
}

export async function createAdminClient() {
  const cookieStore = await cookies();
  const projectId = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);
  const project = PROJECTS[projectId];

  return createServerClient(project.url, project.serviceKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch { /* ignore */ }
      },
    },
  });
}
