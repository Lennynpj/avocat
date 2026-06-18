import { Resend } from "resend";

interface MailInput {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

const FALLBACK_FROM = "Cabinet NGANGA <onboarding@resend.dev>";

export async function sendEmail({ to, subject, html, replyTo }: MailInput) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || FALLBACK_FROM;

  if (!key) {
    console.log(`\n[EMAIL simulé]  → ${to}\n  Sujet : ${subject}\n`);
    return { simulated: true as const };
  }

  try {
    const resend = new Resend(key);
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      replyTo,
    });
    if (error) console.error("[EMAIL erreur Resend]", error);
    return { id: data?.id, error };
  } catch (e) {
    console.error("[EMAIL exception]", e);
    return { error: e };
  }
}

/** Gabarit HTML sobre et lisible pour les emails transactionnels. */
export function emailLayout(title: string, bodyHtml: string): string {
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#f5f3ee;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1b2a4a;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="border-top:3px solid #1b2a4a;background:#ffffff;border:1px solid #e0dbcf;border-radius:14px;overflow:hidden;">
      <div style="padding:22px 28px;border-bottom:1px solid #ece7db;">
        <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8c6d34;font-weight:600;">Cabinet NGANGA</div>
        <div style="font-size:13px;color:#5a6377;margin-top:2px;">Avocat au Barreau de Bobigny</div>
      </div>
      <div style="padding:28px;">
        <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;color:#1b2a4a;">${title}</h1>
        ${bodyHtml}
      </div>
      <div style="padding:18px 28px;border-top:1px solid #ece7db;font-size:12px;color:#8a90a0;">
        12 Allée du Platane Fourchu, 93390 Clichy-sous-bois · 01 43 32 05 84
      </div>
    </div>
  </div></body></html>`;
}
