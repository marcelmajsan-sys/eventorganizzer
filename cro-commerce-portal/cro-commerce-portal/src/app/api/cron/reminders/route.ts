import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendDeadlineReminder, sendOverdueAdminAlert } from "@/lib/email";
import { daysUntil } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createAdminClient();

  // Get all active benefits with sponsor info
  const { data: benefits, error } = await supabase
    .from("sponsor_benefits")
    .select("*, sponsors(name, contact_email)")
    .neq("status", "completed");

  if (error) {
    console.error("Cron error fetching benefits:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = {
    processed: 0,
    reminded30: 0,
    reminded7: 0,
    overdue: 0,
    errors: 0,
  };

  for (const benefit of benefits ?? []) {
    const days = daysUntil(benefit.deadline);
    const sponsor = benefit.sponsors;

    if (!sponsor?.contact_email) continue;

    try {
      if (days === 30) {
        await sendDeadlineReminder(
          sponsor.contact_email,
          sponsor.name,
          benefit.benefit_name,
          benefit.deadline,
          30
        );
        results.reminded30++;
      } else if (days === 7) {
        await sendDeadlineReminder(
          sponsor.contact_email,
          sponsor.name,
          benefit.benefit_name,
          benefit.deadline,
          7
        );
        results.reminded7++;
      } else if (days < 0) {
        // Update status to overdue
        await supabase
          .from("sponsor_benefits")
          .update({ status: "overdue" })
          .eq("id", benefit.id)
          .neq("status", "overdue");

        // Notify admin once per day for each overdue benefit
        await sendOverdueAdminAlert(
          sponsor.name,
          benefit.benefit_name,
          benefit.deadline,
          Math.abs(days)
        );
        results.overdue++;

        // Create notification for sponsor
        await supabase.from("notifications").insert({
          sponsor_id: benefit.sponsor_id,
          title: "Rok je prošao",
          message: `Benefit "${benefit.benefit_name}" je trebao biti dostavljen ${new Date(benefit.deadline).toLocaleDateString("hr-HR")}. Kontaktirajte nas.`,
          read: false,
        });
      }
      results.processed++;
    } catch (emailError) {
      console.error(`Error sending email for benefit ${benefit.id}:`, emailError);
      results.errors++;
    }
  }

  console.log("Cron job completed:", results);
  return NextResponse.json({ success: true, results });
}
