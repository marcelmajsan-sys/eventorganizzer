"use server";

import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import { requireAdmin } from "@/lib/authGuards";

export async function getAdminEmails(): Promise<string[]> {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return [];

    const supabase = createAdminClientForProject(auth.projectId);
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
