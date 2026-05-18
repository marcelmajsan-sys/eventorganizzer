"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import { PROJECT_COOKIE, resolveProjectId } from "@/lib/supabase/projects";

export async function createTask(data: {
  title: string;
  description: string;
  status: string;
  due_date: string;
  assigned_to: string;
}) {
  const adminClient = await createAdminClient();
  const cookieStore = await cookies();
  const projectId = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);
  const serviceClient = createAdminClientForProject(projectId);

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

  // Kreiraj inbox notifikaciju ako je zadatak dodijeljen (bilo koji email)
  if (data.assigned_to.trim().includes("@") && task) {
    const { error: notifError } = await serviceClient.from("notifications").insert({
      task_id: task.id,
      title: "Novi zadatak",
      message: `Dodijeljen vam je zadatak: ${data.title}`,
    });
    if (notifError) {
      console.error("createTask: notification insert failed:", notifError.message);
    }
  }

  revalidatePath("/admin/tasks");
  return { error: null };
}
