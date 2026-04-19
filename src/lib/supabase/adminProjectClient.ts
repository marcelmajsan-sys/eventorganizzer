import { createClient } from "@supabase/supabase-js";
import { PROJECTS, type ProjectId } from "./projects";

export function createAdminClientForProject(projectId: ProjectId) {
  const project = PROJECTS[projectId];
  return createClient(project.url, project.serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
