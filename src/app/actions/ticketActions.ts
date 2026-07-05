"use server";

import { revalidatePath } from "next/cache";
import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import { uniqueSlug } from "@/lib/slugUtils";
import { requireAdmin, requireSponsor } from "@/lib/authGuards";

export type TicketFormData = {
  name: string;
  email: string;
  company: string;
  role: string;
  ticket_type: "vip" | "standard";
  notes: string;
};

async function makeUniqueSlug(supabase: ReturnType<typeof createAdminClientForProject>, name: string) {
  return uniqueSlug(name, async (s) => {
    const { data } = await supabase
      .from("sponsor_contacts")
      .select("id")
      .eq("slug", s)
      .maybeSingle();
    return !!data;
  });
}

export async function createTicket(data: TicketFormData): Promise<{ error: string | null }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  const supabase = createAdminClientForProject(auth.projectId);
  const slug = await makeUniqueSlug(supabase, data.name.trim());

  const record = {
    name: data.name.trim(),
    email: data.email.trim() || null,
    company: data.company.trim() || null,
    role: data.role || null,
    ticket_type: data.ticket_type,
    notes: data.notes.trim() || null,
    type: "ticket",
    sponsor_id: null,
    slug,
  };
  let { error } = await supabase.from("sponsor_contacts").insert({ ...record, source: "admin" });
  // Graceful degradation: retry bez source ako kolona ne postoji (migration_039)
  if (error?.message?.includes("source")) {
    ({ error } = await supabase.from("sponsor_contacts").insert(record));
  }

  if (error) return { error: error.message };
  revalidatePath("/admin/ulaznice");
  return { error: null };
}

export async function bulkCreateTickets(
  rows: TicketFormData[]
): Promise<{ inserted: number; error: string | null }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { inserted: 0, error: auth.error };

  if (rows.length === 0) return { inserted: 0, error: null };
  const supabase = createAdminClientForProject(auth.projectId);

  const records = [];
  for (const r of rows) {
    const slug = await makeUniqueSlug(supabase, r.name.trim());
    records.push({
      name: r.name.trim(),
      email: r.email.trim() || null,
      company: r.company.trim() || null,
      role: r.role || null,
      ticket_type: r.ticket_type,
      notes: r.notes.trim() || null,
      type: "ticket",
      sponsor_id: null,
      slug,
    });
  }

  let { error, data } = await supabase
    .from("sponsor_contacts")
    .insert(records.map((r) => ({ ...r, source: "admin" })))
    .select("id");
  // Graceful degradation: retry bez source ako kolona ne postoji (migration_039)
  if (error?.message?.includes("source")) {
    ({ error, data } = await supabase.from("sponsor_contacts").insert(records).select("id"));
  }
  if (error) return { inserted: 0, error: error.message };
  revalidatePath("/admin/ulaznice");
  return { inserted: data?.length ?? 0, error: null };
}

export async function generateMissingSlugs(): Promise<{ updated: number; error: string | null }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { updated: 0, error: auth.error };

  const supabase = createAdminClientForProject(auth.projectId);

  const { data: contacts, error } = await supabase
    .from("sponsor_contacts")
    .select("id, name")
    .eq("type", "ticket")
    .is("slug", null);

  if (error) return { updated: 0, error: error.message };
  if (!contacts || contacts.length === 0) return { updated: 0, error: null };

  let updated = 0;
  for (const c of contacts) {
    const slug = await makeUniqueSlug(supabase, c.name ?? "ulaznica");
    const { error: upErr } = await supabase
      .from("sponsor_contacts")
      .update({ slug })
      .eq("id", c.id);
    if (!upErr) updated++;
  }

  revalidatePath("/admin/ulaznice");
  return { updated, error: null };
}

export async function createSponsorTicket(
  sponsorId: string,
  data: TicketFormData
): Promise<{ error: string | null }> {
  const auth = await requireSponsor(sponsorId);
  if (!auth.ok) return { error: auth.error };

  const supabase = createAdminClientForProject(auth.projectId);
  const slug = await makeUniqueSlug(supabase, data.name.trim());

  const record = {
    name: data.name.trim(),
    email: data.email.trim() || null,
    company: data.company.trim() || null,
    role: data.role || null,
    ticket_type: data.ticket_type,
    notes: data.notes.trim() || null,
    type: "ticket",
    sponsor_id: sponsorId,
    slug,
  };
  let { error } = await supabase.from("sponsor_contacts").insert({ ...record, source: "portal" });
  // Graceful degradation: retry bez source ako kolona ne postoji (migration_039)
  if (error?.message?.includes("source")) {
    ({ error } = await supabase.from("sponsor_contacts").insert(record));
  }

  if (error) return { error: error.message };
  revalidatePath("/portal/benefits");
  return { error: null };
}

export async function deleteTicket(id: string): Promise<{ error: string | null }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  const supabase = createAdminClientForProject(auth.projectId);
  const { error } = await supabase.from("sponsor_contacts").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/ulaznice");
  return { error: null };
}
