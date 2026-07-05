import { NextRequest, NextResponse } from "next/server";
import { createAdminClientForProject } from "@/lib/supabase/adminProjectClient";
import { requireAdmin } from "@/lib/authGuards";
import { escapeHtml } from "@/lib/utils";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_missing_key");
const FROM_EMAIL = "CRO Commerce <konferencija@ecommerce.hr>";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const supabase = createAdminClientForProject(auth.projectId);

    // Podatke o benefitu čitamo iz baze po id-u — ne vjerujemo request bodyju
    const { data: benefit } = await supabase
      .from("sponsor_benefits")
      .select("benefit_name, deadline, notes, reminder_email, assigned_to, sponsors(name)")
      .eq("id", params.id)
      .single();

    if (!benefit) {
      return NextResponse.json({ error: "Benefit nije pronađen." }, { status: 404 });
    }

    const recipient = benefit.reminder_email || benefit.assigned_to;
    if (!recipient) {
      return NextResponse.json({ error: "Nije definirana odgovorna osoba (email)." }, { status: 400 });
    }

    const sponsorsRaw = benefit.sponsors as unknown;
    const sponsor = (Array.isArray(sponsorsRaw) ? sponsorsRaw[0] : sponsorsRaw) as { name: string } | null;
    const sponsorName = sponsor?.name ?? null;

    const projectName = `CRO Commerce ${auth.projectId}`;

    const deadlineFormatted = benefit.deadline
      ? new Date(benefit.deadline).toLocaleDateString("hr-HR")
      : null;

    const rows = [
      benefit.notes && `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:120px;vertical-align:top">Napomene:</td><td style="padding:8px 0;color:#111827;font-size:14px">${escapeHtml(benefit.notes)}</td></tr>`,
      deadlineFormatted && `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Rok:</td><td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600">${escapeHtml(deadlineFormatted)}</td></tr>`,
    ].filter(Boolean).join("");

    const subject = `${projectName} - Podsjetnik za ${benefit.benefit_name}`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
        <div style="background:#1f2937;padding:24px 32px">
          <span style="color:white;font-weight:700;font-size:18px">CRO Commerce</span>
        </div>
        <div style="padding:32px;background:white">
          <p style="margin:0 0 16px;color:#374151;font-size:15px">Poštovani,</p>
          <p style="margin:0 0 24px;color:#374151;font-size:15px">
            podsjećamo vas na rok za korištenje benefita <strong>${escapeHtml(benefit.benefit_name)}</strong>${sponsorName ? ` (${escapeHtml(sponsorName)})` : ""}.
          </p>
          ${rows ? `<table style="border-collapse:collapse;width:100%;margin-bottom:24px">${rows}</table>` : ""}
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
          <p style="margin:0;color:#9ca3af;font-size:13px">Ovo je automatizirana obavijest. Za sva pitanja proslijedite ovaj mail uz svoj upit na: <a href="mailto:konferencija@ecommerce.hr" style="color:#ea580c">konferencija@ecommerce.hr</a></p>
        </div>
        <div style="background:#f9fafb;padding:16px 32px;text-align:center;font-size:12px;color:#9ca3af">
          CRO Commerce · Zagreb · ecommerce.hr
        </div>
      </div>`;

    const { error: sendError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipient,
      subject,
      html,
    });

    if (sendError) return NextResponse.json({ error: sendError.message }, { status: 500 });

    const { error: logError } = await supabase.from("email_logs").insert({
      benefit_id: params.id,
      recipient,
      subject,
      status: "sent",
    });
    if (logError) {
      console.error("[benefits/notify] email_logs insert error:", logError.message);
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Greška pri slanju.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
