"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import { resolveProjectId, PROJECT_COOKIE } from "@/lib/supabase/projects";

async function getClient() {
  const cookieStore = await cookies();
  const projectId = resolveProjectId(cookieStore.get(PROJECT_COOKIE)?.value);
  return createAdminClientForProject(projectId);
}

export type TicketFormData = {
  name: string;
  email: string;
  company: string;
  role: string; // kategorija tvrtke
  ticket_type: "vip" | "standard";
  notes: string;
};

export async function createTicket(data: TicketFormData): Promise<{ error: string | null }> {
  const supabase = await getClient();

  const { error } = await supabase.from("sponsor_contacts").insert({
    name: data.name.trim(),
    email: data.email.trim() || null,
    company: data.company.trim() || null,
    role: data.role || null,
    ticket_type: data.ticket_type,
    notes: data.notes.trim() || null,
    type: "ticket",
    sponsor_id: null,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/ulaznice");
  return { error: null };
}

export async function bulkCreateTickets(
  rows: TicketFormData[]
): Promise<{ inserted: number; error: string | null }> {
  if (rows.length === 0) return { inserted: 0, error: null };

  const supabase = await getClient();

  const records = rows.map((r) => ({
    name: r.name.trim(),
    email: r.email.trim() || null,
    company: r.company.trim() || null,
    role: r.role || null,
    ticket_type: r.ticket_type,
    notes: r.notes.trim() || null,
    type: "ticket",
    sponsor_id: null,
  }));

  const { error, data } = await supabase.from("sponsor_contacts").insert(records).select("id");

  if (error) return { inserted: 0, error: error.message };
  revalidatePath("/admin/ulaznice");
  return { inserted: data?.length ?? 0, error: null };
}

export async function deleteTicket(id: string): Promise<{ error: string | null }> {
  const supabase = await getClient();
  const { error } = await supabase.from("sponsor_contacts").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/ulaznice");
  return { error: null };
}
