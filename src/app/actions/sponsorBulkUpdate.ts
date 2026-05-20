"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function bulkUpdateSponsors(
  ids: string[],
  fields: {
    package_type?: string;
    payment_status?: string;
    lead_status?: string | null;
  }
) {
  if (ids.length === 0) return { error: "Nema odabranih sponzora" };

  const update: Record<string, string | null> = {};
  if (fields.package_type !== undefined) update.package_type = fields.package_type;
  if (fields.payment_status !== undefined) update.payment_status = fields.payment_status;
  if ("lead_status" in fields) update.lead_status = fields.lead_status ?? null;

  if (Object.keys(update).length === 0) return { error: "Nema polja za ažuriranje" };

  const supabase = await createClient();
  const { error } = await supabase.from("sponsors").update(update).in("id", ids);

  if (error) return { error: error.message };

  revalidatePath("/admin/sponsors");
  return { error: null };
}
