"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/authGuards";

export async function updateConferenceDate(date: string): Promise<{ error: string | null }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("project_settings")
    .upsert({ key: `conference_date_${auth.projectId}`, value: date, updated_at: new Date().toISOString() });
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return { error: null };
}

export async function addProjectAdmin(email: string): Promise<{ error: string | null }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("project_admins")
    .insert({ email: email.toLowerCase().trim() });
  if (error) return { error: error.message };
  revalidatePath("/admin/settings");
  return { error: null };
}

export async function removeProjectAdmin(email: string): Promise<{ error: string | null }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("project_admins")
    .delete()
    .eq("email", email);
  if (error) return { error: error.message };
  revalidatePath("/admin/settings");
  return { error: null };
}
