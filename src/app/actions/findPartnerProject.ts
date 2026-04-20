"use server";

import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";

export async function findPartnerProject(email: string): Promise<"2026" | "2025" | null> {
  const normalizedEmail = email.toLowerCase().trim();

  for (const pid of ["2026", "2025"] as const) {
    try {
      const admin = createAdminClientForProject(pid);
      const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
      const found = data?.users?.find((u) => u.email?.toLowerCase() === normalizedEmail);
      if (found) return pid;
    } catch {}
  }

  return null;
}
