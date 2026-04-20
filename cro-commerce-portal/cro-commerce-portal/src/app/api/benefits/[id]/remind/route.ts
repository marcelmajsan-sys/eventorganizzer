import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "CRO Commerce <noreply@cro-commerce.hr>";

function applyVars(text: string, vars: Record<string, string>) {
  return Object.entries(vars).reduce(
    (t, [k, v]) => t.replaceAll(`{{${k}}}`, v),
    text
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { template_id, recipient_email } = await req.json();
    const supabase = await createClient();

    // Dohvati benefit + sponzora
    const { data: benefit } = await supabase
      .from("sponsor_benefits")
      .select("*, sponsors(name)")
      .eq("id", params.id)
      .single();

    if (!benefit) return NextResponse.json({ error: "Benefit nije pronađen." }, { status: 404 });

    const sponsorName = (benefit.sponsors as { name: string } | null)?.name ?? "—";
    const deadlineDate = benefit.deadline ? new Date(benefit.deadline) : null;
    const daysLeft = deadlineDate
      ? Math.ceil((deadlineDate.getTime() - Date.now()) / 86400000)
      : null;

    const vars: Record<string, string> = {
      benefit_name: benefit.benefit_name,
      sponsor_name: sponsorName,
      deadline: deadlineDate ? deadlineDate.toLocaleDateString("hr-HR") : "—",
      days_left: daysLeft !== null ? `${daysLeft}` : "—",
      notes: benefit.notes ?? "",
    };

    let subject: string;
    let bodyHtml: string;

    if (template_id) {
      const { data: tpl } = await supabase
        .from("email_templates")
        .select("*")
        .eq("id", template_id)
        .single();

      if (!tpl) return NextResponse.json({ error: "Predložak nije pronađen." }, { status: 404 });

      subject = applyVars(tpl.subject, vars);
      const bodyText = applyVars(tpl.body, vars);
      const btnHtml = tpl.button_text
        ? `<div style="margin-top:24px"><a href="${tpl.button_url ?? "#"}" style="display:inline-block;background:#ea580c;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">${tpl.button_text}</a></div>`
        : "";

      bodyHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
          <div style="background:#1f2937;padding:24px 32px;display:flex;align-items:center;gap:12px">
            <span style="color:white;font-weight:700;font-size:18px">CRO Commerce</span>
          </div>
          <div style="padding:32px;background:white">
            ${bodyText.split("\n").filter(Boolean).map(l => `<p style="margin:0 0 12px;color:#374151;font-size:15px;line-height:1.6">${l}</p>`).join("")}
            ${btnHtml}
          </div>
          <div style="background:#f9fafb;padding:16px 32px;text-align:center;font-size:12px;color:#9ca3af">
            CRO Commerce · Zagreb · cro-commerce.hr
          </div>
        </div>`;
    } else {
      // Fallback — bez predloška
      subject = `Podsjetnik: ${benefit.benefit_name}${daysLeft !== null ? ` (${daysLeft} dana do roka)` : ""}`;
      bodyHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
          <div style="background:#1f2937;padding:24px 32px"><span style="color:white;font-weight:700;font-size:18px">CRO Commerce</span></div>
          <div style="padding:32px;background:white">
            <p style="margin:0 0 12px;color:#374151;font-size:15px">Podsjetnik za benefit <strong>${benefit.benefit_name}</strong> (${sponsorName}).</p>
            ${deadlineDate ? `<p style="margin:0 0 12px;color:#374151;font-size:15px">Rok: <strong>${deadlineDate.toLocaleDateString("hr-HR")}</strong>${daysLeft !== null ? ` (za ${daysLeft} dana)` : ""}</p>` : ""}
          </div>
        </div>`;
    }

    const to = recipient_email || benefit.reminder_email || benefit.assigned_to;
    if (!to) return NextResponse.json({ error: "Nije definiran primatelj emaila." }, { status: 400 });

    await resend.emails.send({ from: FROM_EMAIL, to, subject, html: bodyHtml });

    // Logiraj slanje
    await supabase.from("email_logs").insert({
      benefit_id: params.id,
      recipient: to,
      subject,
      status: "sent",
    });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Greška pri slanju.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
