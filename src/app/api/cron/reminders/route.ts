import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendOverdueAdminAlert } from "@/lib/email";
import { daysUntil } from "@/lib/utils";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "CRO Commerce <noreply@cro-commerce.hr>";

function applyVars(text: string, vars: Record<string, string>) {
  return Object.entries(vars).reduce(
    (t, [k, v]) => t.replaceAll(`{{${k}}}`, v),
    text
  );
}

function buildHtml(body: string, buttonText?: string | null, buttonUrl?: string | null) {
  const paragraphs = body
    .split("\n")
    .filter(Boolean)
    .map(l => `<p style="margin:0 0 12px;color:#374151;font-size:15px;line-height:1.6">${l}</p>`)
    .join("");
  const btn = buttonText
    ? `<div style="margin-top:24px"><a href="${buttonUrl ?? "#"}" style="display:inline-block;background:#ea580c;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">${buttonText}</a></div>`
    : "";
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="background:#1f2937;padding:24px 32px">
        <span style="color:white;font-weight:700;font-size:18px">CRO Commerce</span>
      </div>
      <div style="padding:32px;background:white">${paragraphs}${btn}</div>
      <div style="background:#f9fafb;padding:16px 32px;text-align:center;font-size:12px;color:#9ca3af">
        CRO Commerce · Zagreb · cro-commerce.hr
      </div>
    </div>`;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const results = {
    automations_processed: 0,
    emails_sent: 0,
    emails_skipped: 0,
    overdue_marked: 0,
    errors: 0,
  };

  // ── 1. Automatizacijski podsjetnici ──────────────────────────────────────
  const { data: automations } = await supabase
    .from("email_automations")
    .select("*, email_templates(*)")
    .eq("is_active", true)
    .eq("trigger_type", "benefit_deadline");

  for (const auto of automations ?? []) {
    results.automations_processed++;
    const tpl = auto.email_templates as {
      subject: string; body: string;
      button_text: string | null; button_url: string | null;
    } | null;

    // Dohvati benefite čiji rok pada za točno days_before dana (ili manje, nije poslan danas)
    const { data: benefits } = await supabase
      .from("sponsor_benefits")
      .select("*, sponsors(name)")
      .neq("status", "completed")
      .not("deadline", "is", null);

    for (const benefit of benefits ?? []) {
      const days = daysUntil(benefit.deadline);
      if (days < 0 || days > auto.days_before) continue;

      const sponsor = benefit.sponsors as { name: string } | null;
      const recipient =
        benefit.reminder_email || benefit.assigned_to ||
        (sponsor ? null : null);

      if (!recipient) continue;

      // Provjeri duplikat — nije poslano danas za ovaj automation+benefit
      const { data: existing } = await supabase
        .from("email_logs")
        .select("id")
        .eq("automation_id", auto.id)
        .eq("benefit_id", benefit.id)
        .gte("sent_at", `${today}T00:00:00Z`)
        .limit(1);

      if (existing && existing.length > 0) {
        results.emails_skipped++;
        continue;
      }

      const vars: Record<string, string> = {
        benefit_name: benefit.benefit_name,
        sponsor_name: sponsor?.name ?? "—",
        deadline: new Date(benefit.deadline).toLocaleDateString("hr-HR"),
        days_left: String(days),
      };

      const subject = applyVars(
        auto.custom_subject || tpl?.subject || `Podsjetnik: ${benefit.benefit_name}`,
        vars
      );
      const bodyText = applyVars(
        tpl?.body || `Podsjetnik za benefit {{benefit_name}}. Rok: {{deadline}} (za {{days_left}} dana).`,
        vars
      );
      const html = buildHtml(bodyText, tpl?.button_text, tpl?.button_url);

      try {
        await resend.emails.send({ from: FROM_EMAIL, to: recipient, subject, html });
        await supabase.from("email_logs").insert({
          automation_id: auto.id,
          benefit_id: benefit.id,
          recipient,
          subject,
          status: "sent",
        });
        results.emails_sent++;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "unknown";
        await supabase.from("email_logs").insert({
          automation_id: auto.id,
          benefit_id: benefit.id,
          recipient,
          subject,
          status: "error",
          error_message: msg,
        });
        results.errors++;
      }
    }
  }

  // ── 2. Označi zakasnele benefite + obavijesti admina ─────────────────────
  const { data: allBenefits } = await supabase
    .from("sponsor_benefits")
    .select("*, sponsors(name, contact_email)")
    .neq("status", "completed")
    .not("deadline", "is", null);

  for (const benefit of allBenefits ?? []) {
    const days = daysUntil(benefit.deadline);
    if (days >= 0) continue;

    const sponsor = benefit.sponsors as { name: string; contact_email: string } | null;

    try {
      await supabase
        .from("sponsor_benefits")
        .update({ status: "overdue" })
        .eq("id", benefit.id)
        .neq("status", "overdue");

      if (sponsor?.name) {
        await sendOverdueAdminAlert(
          sponsor.name,
          benefit.benefit_name,
          benefit.deadline,
          Math.abs(days)
        );
      }
      results.overdue_marked++;
    } catch (e) {
      results.errors++;
    }
  }

  console.log("Cron reminders:", results);
  return NextResponse.json({ success: true, results });
}
