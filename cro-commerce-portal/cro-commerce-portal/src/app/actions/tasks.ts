"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/authGuards";

export async function createTask(data: {
  title: string;
  description: string;
  status: string;
  due_date: string;
  assigned_to: string;
}) {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error, data: null };

  const adminClient = await createAdminClient();

  const payload: Record<string, any> = {
    title: data.title,
    status: data.status,
  };
  if (data.description) payload.description = data.description;
  if (data.due_date) payload.due_date = data.due_date;
  if (data.assigned_to) payload.assigned_to = data.assigned_to.trim();

  const { data: task, error } = await adminClient
    .from("tasks")
    .insert(payload)
    .select("*, sponsors(name, package_type)")
    .single();

  if (error) return { error: error.message, data: null };

  // Notifikacija se kreira automatski via Postgres trigger (migration_021)

  revalidatePath("/admin/tasks");
  return { error: null, data: task };
}
