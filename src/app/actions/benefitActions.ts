"use server";

import { revalidatePath } from "next/cache";
import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import { requireAdmin } from "@/lib/authGuards";

const ALLOWED_STATUSES = ["not_started", "in_progress", "completed", "overdue"];

export async function updateBenefitStatus(
  benefitId: string,
  newStatus: string
): Promise<{ error: string | null }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  if (!ALLOWED_STATUSES.includes(newStatus)) {
    return { error: "Nevažeći status benefita." };
  }

  const adminClient = createAdminClientForProject(auth.projectId);

  const { data, error } = await adminClient
    .from("sponsor_benefits")
    .update({ status: newStatus })
    .eq("id", benefitId)
    .select("sponsor_id")
    .maybeSingle();

  if (error) return { error: error.message };

  // Datoteka je pod route group (protected) — revalidiraj i template putanju
  // i konkretnu stranicu sponzora ako je sponsor_id dostupan.
  revalidatePath("/admin/sponsors/[id]", "page");
  if (data?.sponsor_id) revalidatePath(`/admin/sponsors/${data.sponsor_id}`);
  revalidatePath("/admin/benefits");
  return { error: null };
}
