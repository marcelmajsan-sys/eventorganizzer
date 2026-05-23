"use server";

import { cookies } from "next/headers";
import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import { PROJECT_COOKIE, resolveProjectId } from "@/lib/supabase/projects";

export async function getAdminEmails(): Promise<string[]> {
  try {
    const cookieStore = await cookies();
    const projectId = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);
    const supabase = createAdminClientForProject(projectId);
    const { data, error } = await supabase
      .from("project_admins")
      .select("email")
      .order("email");
    if (error) return [];
    return (data ?? []).map((row: { email: string }) => row.email);
  } catch {
    return [];
  }
}
