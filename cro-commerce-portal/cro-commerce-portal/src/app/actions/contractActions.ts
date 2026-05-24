"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";

export async function acceptContract(
  sponsorId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Niste prijavljeni." };

  const adminClient = await createAdminClient();
  const now = new Date().toISOString();

  const { error } = await adminClient
    .from("sponsor_users")
    .update({
      contract_accepted_at: now,
      contract_accepted_by: user.email ?? user.id,
    })
    .eq("sponsor_id", sponsorId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { error: null };
}
