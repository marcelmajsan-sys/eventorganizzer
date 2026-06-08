import { NextRequest, NextResponse } from "next/server";
import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);
  let sent = 0;
  let errors = 0;

  for (const projectId of ["2026", "2025"] as const) {
    const supabase = createAdminClientForProject(projectId);

    const { data: reminders } = await supabase
      .from("sponsor_comment_reminders")
      .select("id, sponsor_id, comment_text, admin_email, remind_at")
      .eq("sent", false)
      .lte("remind_at", today);

    if (!reminders?.length) continue;

    for (const r of reminders) {
      const remindDate = new Date(r.remind_at).toLocaleDateString("hr-HR", {
        day: "2-digit", month: "2-digit", year: "numeric",
      });

      const { error } = await supabase.from("notifications").insert({
        sponsor_id: r.sponsor_id,
        title: "Follow up podsjetnik",
        message: `${r.comment_text} — ${r.admin_email.split("@")[0]} (${remindDate})`,
      });

      if (!error) {
        await supabase
          .from("sponsor_comment_reminders")
          .update({ sent: true })
          .eq("id", r.id);
        sent++;
      } else {
        errors++;
      }
    }
  }

  return NextResponse.json({ success: true, sent, errors });
}
