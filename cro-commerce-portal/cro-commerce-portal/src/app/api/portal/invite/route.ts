import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";

export async function POST(req: NextRequest) {
  try {
    const { email, sponsor_id, sponsor_name, project_id } = await req.json();

    if (!email || !sponsor_id) {
      return NextResponse.json({ error: "email and sponsor_id required" }, { status: 400 });
    }

    const supabase = project_id === "2025" || project_id === "2026"
      ? createAdminClientForProject(project_id)
      : await createAdminClient();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // Invite user via Supabase Auth magic link / invite
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${appUrl}/portal/benefits`,
      data: { sponsor_name },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Upsert sponsor_users mapping
    const userId = data.user?.id;
    if (userId) {
      await supabase
        .from("sponsor_users")
        .upsert({ user_id: userId, sponsor_id, invited_by: "admin" }, { onConflict: "user_id" });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
