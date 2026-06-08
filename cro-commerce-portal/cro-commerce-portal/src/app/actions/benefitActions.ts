"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";

export async function updateBenefitStatus(
  benefitId: string,
  newStatus: string
): Promise<{ error: string | null }> {
  const adminClient = await createAdminClient();

  const { error } = await adminClient
    .from("sponsor_benefits")
    .update({ status: newStatus })
    .eq("id", benefitId);

  if (error) return { error: error.message };

  revalidatePath("/admin/sponsors/[id]", "page");
  revalidatePath("/admin/benefits");
  return { error: null };
}
