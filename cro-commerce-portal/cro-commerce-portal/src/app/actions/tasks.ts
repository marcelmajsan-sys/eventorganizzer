"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";

export async function createTask(data: {
  title: string;
  description: string;
  status: string;
  due_date: string;
  assigned_to: string;
}) {
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
    .select("id")
    .single();

  if (error) return { error: error.message };

  // Notifikacija se kreira automatski via Postgres trigger (migration_021)

  revalidatePath("/admin/tasks");
  return { error: null };
}
