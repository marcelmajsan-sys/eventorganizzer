import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "CRO Commerce <noreply@ecommerce.hr>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "tim@ecommerce.hr";

export async function sendDeadlineReminder(
  to: string,
  sponsorName: string,
  benefitName: string,
  deadline: string,
  daysRemaining: number
) {
  const isUrgent = daysRemaining <= 7;
  const subject = isUrgent
    ? `⚠️ HITNO: ${benefitName} - rok za ${daysRemaining} dana`
    : `📅 Podsjetnik: ${benefitName} - rok za ${daysRemaining} dana`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
        <div style="background: ${isUrgent ? "#dc2626" : "#ea580c"}; padding: 32px 40px;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">
            ${isUrgent ? "⚠️ Hitni podsjetnik" : "📅 Podsjetnik za rok"}
          </h1>
          <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 16px;">CRO Commerce 2025</p>
        </div>
        <div style="padding: 40px;">
          <p style="font-size: 16px; color: #374151; margin: 0 0 16px;">Poštovani/a iz tvrtke <strong>${sponsorName}</strong>,</p>
          <p style="font-size: 16px; color: #374151; margin: 0 0 24px;">
            Podsjećamo vas da benefit <strong>"${benefitName}"</strong> ima rok predaje 
            <strong>${new Date(deadline).toLocaleDateString("hr-HR")}</strong> — 
            to je za <strong style="color: ${isUrgent ? "#dc2626" : "#ea580c"};">${daysRemaining} ${daysRemaining === 1 ? "dan" : "dana"}</strong>.
          </p>
          ${isUrgent ? `<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="color: #991b1b; margin: 0; font-weight: 600;">Molimo vas da materijale dostavite što prije kako bismo mogli ispuniti sve obveze.</p>
          </div>` : ""}
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal" 
            style="display: inline-block; background: #ea580c; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Otvorite sponzorski portal →
          </a>
          <p style="font-size: 14px; color: #9ca3af; margin: 32px 0 0;">
            Za pitanja nas kontaktirajte na <a href="mailto:${ADMIN_EMAIL}" style="color: #ea580c;">${ADMIN_EMAIL}</a>
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendOverdueAdminAlert(
  sponsorName: string,
  benefitName: string,
  deadline: string,
  daysOverdue: number
) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `🚨 Rok prošao: ${sponsorName} - ${benefitName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #7f1d1d; padding: 24px 32px;">
          <h1 style="color: white; margin: 0; font-size: 20px;">🚨 Rok prošao - Potrebna akcija</h1>
        </div>
        <div style="padding: 32px; background: white; border: 1px solid #e5e7eb; border-top: none;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; color: #6b7280; font-size: 14px;">Sponzor:</td><td style="padding: 8px; font-weight: 600;">${sponsorName}</td></tr>
            <tr style="background: #f9fafb;"><td style="padding: 8px; color: #6b7280; font-size: 14px;">Benefit:</td><td style="padding: 8px; font-weight: 600;">${benefitName}</td></tr>
            <tr><td style="padding: 8px; color: #6b7280; font-size: 14px;">Rok bio:</td><td style="padding: 8px;">${new Date(deadline).toLocaleDateString("hr-HR")}</td></tr>
            <tr style="background: #fef2f2;"><td style="padding: 8px; color: #6b7280; font-size: 14px;">Kašnjenje:</td><td style="padding: 8px; font-weight: 600; color: #dc2626;">${daysOverdue} dana</td></tr>
          </table>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/sponsors" 
            style="display: inline-block; margin-top: 24px; background: #dc2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Upravljaj sponzorima →
          </a>
        </div>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(
  to: string,
  sponsorName: string,
  contactName: string,
  temporaryPassword: string
) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Dobrodošli u CRO Commerce 2025 sponzorski portal`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
        <div style="background: linear-gradient(135deg, #ea580c, #c2410c); padding: 40px;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">CRO Commerce 2025</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">Sponzorski portal</p>
        </div>
        <div style="padding: 40px;">
          <p style="font-size: 16px; color: #374151;">Dragi/a <strong>${contactName}</strong>,</p>
          <p style="font-size: 16px; color: #374151;">Dobrodošli u sponzorski portal za tvrtku <strong>${sponsorName}</strong>!</p>
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">Vaši pristupni podaci:</p>
            <p style="margin: 0 0 4px;"><strong>Email:</strong> ${to}</p>
            <p style="margin: 0;"><strong>Lozinka:</strong> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${temporaryPassword}</code></p>
          </div>
          <p style="font-size: 14px; color: #6b7280;">Molimo promijenite lozinku pri prvom prijavi.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" 
            style="display: inline-block; background: #ea580c; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Prijavi se u portal →
          </a>
        </div>
      </div>
    `,
  });
}
