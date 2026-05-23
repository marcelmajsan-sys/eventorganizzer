"use server";

import { createAdminClient } from "@/lib/supabase/server";

export async function getAdminEmails(): Promise<string[]> {
  try {
    const supabase = await createAdminClient();
    const { data } = await supabase
      .from("project_admins")
      .select("email")
      .order("email");
    return (data ?? []).map((row: { email: string }) => row.email);
  } catch {
    return [];
  }
}
