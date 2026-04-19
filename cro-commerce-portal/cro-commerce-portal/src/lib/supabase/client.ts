import { createBrowserClient } from "@supabase/ssr";
import { PROJECT_COOKIE, PROJECTS, resolveProjectId } from "./projects";

function getActiveProject() {
  if (typeof document === "undefined") return PROJECTS["2026"];
  const match = document.cookie.match(new RegExp(`(?:^|; )${PROJECT_COOKIE}=([^;]*)`));
  return PROJECTS[resolveProjectId(match?.[1])];
}

export function createClient() {
  const project = getActiveProject();
  return createBrowserClient(project.url, project.anonKey);
}
