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

  // Ako je assigned_to email admina → kreiraj inbox notifikaciju
  const email = data.assigned_to.trim().toLowerCase();
  if (email.includes("@") && task) {
    const { data: admin } = await adminClient
      .from("project_admins")
      .select("email")
      .ilike("email", email)
      .maybeSingle();

    if (admin) {
      const { error: notifError } = await adminClient.from("notifications").insert({
        task_id: task.id,
        title: "Novi zadatak",
        message: `Dodijeljen vam je zadatak: ${data.title}`,
      });
      if (notifError) {
        console.error("createTask: notification insert failed:", notifError.message);
      }
    } else {
      console.log(`createTask: no project_admin found for email=${email}, skipping notification`);
    }
  }

  revalidatePath("/admin/tasks");
  return { error: null };
}
