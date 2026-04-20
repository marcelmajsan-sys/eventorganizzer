import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "CRO Commerce <konferencija@ecommerce.hr>";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { benefit_name, assigned_to, deadline, notes, sponsor_name } = await req.json();

    if (!assigned_to) {
      return NextResponse.json({ error: "Nije definirana odgovorna osoba (email)." }, { status: 400 });
    }

    const deadlineFormatted = deadline
      ? new Date(deadline).toLocaleDateString("hr-HR")
      : null;

    const rows = [
      notes && `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:120px;vertical-align:top">Napomene:</td><td style="padding:8px 0;color:#111827;font-size:14px">${notes}</td></tr>`,
      deadlineFormatted && `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Rok:</td><td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600">${deadlineFormatted}</td></tr>`,
    ].filter(Boolean).join("");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
        <div style="background:#1f2937;padding:24px 32px">
          <span style="color:white;font-weight:700;font-size:18px">CRO Commerce</span>
        </div>
        <div style="padding:32px;background:white">
          <p style="margin:0 0 8px;color:#374151;font-size:15px">Poštovani,</p>
          <p style="margin:0 0 24px;color:#374151;font-size:15px">
            Obavještavamo vas o benefitu <strong>${benefit_name}</strong>${sponsor_name ? ` (${sponsor_name})` : ""}.
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
      to: assigned_to,
      subject: `CRO Commerce - ${benefit_name}`,
      html,
    });

    if (sendError) return NextResponse.json({ error: sendError.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Greška pri slanju.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
