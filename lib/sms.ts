interface SmsInput {
  to: string; // format français accepté, normalisé en +33
  text: string;
}

function toE164FR(num: string): string {
  const digits = num.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("0")) return "+33" + digits.slice(1);
  if (digits.startsWith("33")) return "+" + digits;
  return digits;
}

/**
 * SMS via Brevo (solde de crédits prépayé, rechargeable).
 * Sans clé API → simulation console (dev local, aucun envoi réel).
 * Env requis :
 *   BREVO_API_KEY = clé API v3 (Brevo → « SMTP & API » → onglet API Keys, préfixe « xkeysib- »)
 *   SMS_SENDER    = expéditeur affiché, ex. « NGANGA » (max 11 caractères alphanumériques,
 *                   à faire valider dans Brevo → Senders pour la France)
 */
export async function sendSms({ to, text }: SmsInput) {
  const apiKey = process.env.BREVO_API_KEY;
  const sender = (process.env.SMS_SENDER || "NGANGA").slice(0, 11);
  const e164 = toE164FR(to);
  const recipient = e164.replace(/^\+/, ""); // Brevo attend l'indicatif sans « + » (ex. 33612345678)

  if (!apiKey) {
    console.log(`\n[SMS simulé]  → ${e164}\n  ${text}\n`);
    return { simulated: true as const };
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/transactionalSMS/send", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender,
        recipient,
        content: text,
        type: "transactional",
      }),
    });

    if (!res.ok) {
      console.error("[SMS erreur Brevo]", res.status, await res.text());
      return { error: `HTTP ${res.status}` };
    }
    const data = (await res.json()) as { messageId?: number | string };
    return { ok: true as const, id: String(data.messageId ?? "") };
  } catch (e) {
    console.error("[SMS exception]", e);
    return { error: e };
  }
}
