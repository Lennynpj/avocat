import { verifyRdvActionToken } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { notifyValidated, notifyDeclined } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Page HTML simple affichée à l'avocat après le clic depuis l'email.
function page(title: string, message: string): Response {
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
  <body style="margin:0;background:#f5f3ee;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1b2a4a;">
    <div style="max-width:480px;margin:14vh auto;padding:0 20px;text-align:center;">
      <div style="background:#fff;border:1px solid #e0dbcf;border-top:3px solid #1b2a4a;border-radius:16px;padding:40px 28px;">
        <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8c6d34;font-weight:600;">Cabinet NGANGA</div>
        <h1 style="margin:14px 0 8px;font-size:22px;line-height:1.25;">${title}</h1>
        <p style="margin:0;color:#5a6377;line-height:1.55;">${message}</p>
      </div>
    </div>
  </body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") || "";
  const action = url.searchParams.get("a") || "";
  const token = url.searchParams.get("t") || "";

  if (!verifyRdvActionToken(id, action, token)) {
    return page(
      "Lien invalide",
      "Ce lien de validation n'est pas valide ou a expiré. Validez le rendez-vous depuis l'agenda en ligne.",
    );
  }

  const store = getStore();
  const booking = await store.getBooking(id);
  if (!booking) return page("Rendez-vous introuvable", "Cette demande n'existe plus.");

  if (booking.statut !== "a_valider") {
    return page("Demande déjà traitée", "Ce rendez-vous a déjà été confirmé ou refusé. Consultez l'agenda pour son statut.");
  }

  if (action === "oui") {
    const statut = booking.type === "consultation" ? "a_payer_especes" : "confirme";
    const updated = await store.updateBooking(id, { statut });
    if (updated) await notifyValidated(updated);
    return page(
      "Rendez-vous confirmé",
      `Le rendez-vous de ${booking.client.nom} est confirmé. Le client vient d'en être informé par email et SMS.`,
    );
  }

  const updated = await store.updateBooking(id, { statut: "annule" });
  if (updated) await notifyDeclined(updated);
  return page(
    "Rendez-vous refusé",
    `La demande de ${booking.client.nom} a été refusée et le créneau libéré. Le client vient d'en être informé.`,
  );
}
