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
 * SMS via Twilio (solde prépayé rechargeable).
 * Sans identifiants → simulation console (dev local, aucun envoi réel).
 * Env requis :
 *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
 *   TWILIO_FROM = numéro « +33… », expéditeur alphanumérique « NGANGA »,
 *                 ou Messaging Service « MG… ».
 */
export async function sendSms({ to, text }: SmsInput) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  const recipient = toE164FR(to);

  if (!sid || !token || !from) {
    console.log(`\n[SMS simulé]  → ${recipient}\n  ${text}\n`);
    return { simulated: true as const };
  }

  try {
    const params = new URLSearchParams();
    params.set("To", recipient);
    if (from.startsWith("MG")) params.set("MessagingServiceSid", from);
    else params.set("From", from);
    params.set("Body", text);

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!res.ok) {
      console.error("[SMS erreur Twilio]", res.status, await res.text());
      return { error: `HTTP ${res.status}` };
    }
    const data = (await res.json()) as { sid?: string };
    return { ok: true as const, id: data.sid };
  } catch (e) {
    console.error("[SMS exception]", e);
    return { error: e };
  }
}
