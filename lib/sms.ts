interface SmsInput {
  to: string; // format français accepté, normalisé en +33
  text: string;
}

function toE164FR(num: string): string {
  const digits = num.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("0")) return "+33" + digits.slice(1);
  return digits;
}

/**
 * SMS via smsmode (Phase 1). Sans clé API → simulation console (POC).
 * Choix retenu : SMS au client ET à l'avocat 24h avant le RDV.
 */
export async function sendSms({ to, text }: SmsInput) {
  const key = process.env.SMSMODE_API_KEY;
  const recipient = toE164FR(to);

  if (!key) {
    console.log(`\n[SMS simulé]  → ${recipient}\n  ${text}\n`);
    return { simulated: true as const };
  }

  try {
    const res = await fetch("https://rest.smsmode.com/sms/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Api-Key": key },
      body: JSON.stringify({
        recipient: { to: recipient },
        body: { text },
        from: process.env.SMS_SENDER || "CabinetAv",
      }),
    });
    if (!res.ok) {
      console.error("[SMS erreur smsmode]", res.status, await res.text());
      return { error: `HTTP ${res.status}` };
    }
    return { ok: true as const };
  } catch (e) {
    console.error("[SMS exception]", e);
    return { error: e };
  }
}
