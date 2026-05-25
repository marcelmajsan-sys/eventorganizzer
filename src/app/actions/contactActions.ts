"use server";

import { createAdminClient } from "@/lib/supabase/server";

/**
 * Briše kontakt iz sponsor_contacts tablice koristeći admin klijent
 * (zaobilazi RLS — browser klijent može tiho failati zbog RLS ili FK).
 * Vraća { error: string | null }
 */
export async function deleteContact(id: string): Promise<{ error: string | null }> {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("sponsor_contacts")
    .delete()
    .eq("id", id);

  if (error) {
    // FK violation — kontakt je referenciran u sponsor_users ili drugdje
    if (error.message?.includes("foreign key") || error.code === "23503") {
      return {
        error:
          "Ovaj kontakt je povezan s korisničkim računom sponzorskog portala i ne može se obrisati. " +
          "Najprije obrišite korisnika u Postavke → Partneri.",
      };
    }
    return { error: error.message };
  }

  return { error: null };
}
