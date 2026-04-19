"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { PROJECT_COOKIE, resolveProjectId } from "@/lib/supabase/projects";

export async function updateConferenceDate(date: string) {
  const cookieStore = await cookies();
  const projectId = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("project_settings")
    .upsert({ key: `conference_date_${projectId}`, value: date, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
}

export async function addProjectAdmin(email: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("project_admins")
    .insert({ email: email.toLowerCase().trim() });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/settings");
}

export async function removeProjectAdmin(email: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("project_admins")
    .delete()
    .eq("email", email);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/settings");
}
