"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PROJECT_COOKIE, type ProjectId } from "@/lib/supabase/projects";
import { createClient } from "@/lib/supabase/server";
import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";

const FALLBACK_ADMIN_EMAILS = [
  "marcel@ecommerce.hr",
  "udruga@ecommerce.hr",
  "laura@ecommerce.hr",
];

export async function switchProject(projectId: ProjectId) {
  const currentSupabase = await createClient();
  const { data: { user } } = await currentSupabase.auth.getUser();

  const cookieStore = await cookies();
  cookieStore.set(PROJECT_COOKIE, projectId, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  if (!user?.email) {
    redirect("/login");
  }

  // Check if user has access to the target project
  const targetAdmin = createAdminClientForProject(projectId);
  const { data: adminRow } = await targetAdmin
    .from("project_admins")
    .select("email")
    .eq("email", user.email)
    .maybeSingle();

  const hasAccess = adminRow !== null || FALLBACK_ADMIN_EMAILS.includes(user.email!);

  if (hasAccess) {
    // Just switch the cookie — no sign-out needed.
    // If both projects share the same Supabase instance the session stays valid.
    // If they use separate instances the middleware will redirect to login automatically.
    redirect("/admin/dashboard");
  }

  // No access to target project
  await currentSupabase.auth.signOut();
  redirect("/login");
}
