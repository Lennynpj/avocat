import { verifyRdvActionToken, verifyRdvViewToken, rdvActionToken } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { notifyValidated, notifyDeclined } from "@/lib/notify";
import { formatDateLong, slotStart } from "@/lib/dates";
import type { Booking } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}

// Page HTML simple affichée à l'avocat (résultat ou message).
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

// Page « Accepter / Refuser » — ouverte depuis le lien reçu par SMS (aucune action encore faite).
function landingPage(b: Booking): Response {
  const ouiUrl = `/api/rdv/valider?id=${encodeURIComponent(b.id)}&a=oui&t=${rdvActionToken(b.id, "oui")}`;
  const nonUrl = `/api/rdv/valider?id=${encodeURIComponent(b.id)}&a=non&t=${rdvActionToken(b.id, "non")}`;
  const type = b.type === "consultation" ? "Rendez-vous (consultation)" : "Suivi de dossier";
  const tel = escapeHtml(b.client.telephone);
  const row = (label: string, value: string) =>
    `<div style="display:flex;justify-content:space-between;gap:16px;padding:11px 0;border-bottom:1px solid #eee7d9;"><span style="color:#8a90a0;">${label}</span><span style="font-weight:600;text-align:right;">${value}</span></div>`;
  const btn = (href: string, label: string, bg: string) =>
    `<a href="${href}" style="display:block;margin:0 0 12px;padding:16px;border-radius:12px;background:${bg};color:#fff;font-weight:700;font-size:17px;text-decoration:none;text-align:center;">${label}</a>`;
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Demande de rendez-vous</title></head>
  <body style="margin:0;background:#f5f3ee;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1b2a4a;">
    <div style="max-width:460px;margin:7vh auto;padding:0 20px;">
      <div style="background:#fff;border:1px solid #e0dbcf;border-top:3px solid #1b2a4a;border-radius:16px;padding:32px 24px;">
        <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8c6d34;font-weight:600;text-align:center;">Cabinet NGANGA</div>
        <h1 style="margin:12px 0 20px;font-size:21px;line-height:1.25;text-align:center;">Demande de rendez-vous</h1>
        <div style="margin:0 0 24px;font-size:15px;">
          ${row("Client", escapeHtml(b.client.nom))}
          ${row("Objet", type)}
          ${row("Créneau", `${formatDateLong(b.date)} à ${slotStart(b.hour)}`)}
          ${row("Téléphone", `<a href="tel:${tel}" style="color:#1b2a4a;">${tel}</a>`)}
          ${b.dossier ? row("Dossier", escapeHtml(b.dossier)) : ""}
        </div>
        ${btn(ouiUrl, "Accepter le rendez-vous", "#1f7a52")}
        ${btn(nonUrl, "Refuser", "#9E2A2E")}
        <p style="margin:14px 0 0;font-size:13px;color:#8a90a0;text-align:center;line-height:1.5;">Le client sera prévenu automatiquement par email et SMS.</p>
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

  // Mode consultation (lien SMS) : pas d'action → on affiche la page Accepter / Refuser.
  if (!action) {
    if (!verifyRdvViewToken(id, token)) {
      return page("Lien invalide", "Ce lien n'est pas valide ou a expiré. Validez le rendez-vous depuis l'agenda en ligne.");
    }
    const store = getStore();
    const booking = await store.getBooking(id);
    if (!booking) return page("Rendez-vous introuvable", "Cette demande n'existe plus.");
    if (booking.statut !== "a_valider") {
      return page("Demande déjà traitée", "Ce rendez-vous a déjà été confirmé ou refusé. Consultez l'agenda pour son statut.");
    }
    return landingPage(booking);
  }

  // Mode action (lien 1-clic email, ou boutons de la page) : a=oui|non.
  if (!verifyRdvActionToken(id, action, token)) {
    return page("Lien invalide", "Ce lien de validation n'est pas valide ou a expiré. Validez le rendez-vous depuis l'agenda en ligne.");
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
      `Le rendez-vous de ${escapeHtml(booking.client.nom)} est confirmé. Le client vient d'en être informé par email et SMS.`,
    );
  }

  const updated = await store.updateBooking(id, { statut: "annule" });
  if (updated) await notifyDeclined(updated);
  return page(
    "Rendez-vous refusé",
    `La demande de ${escapeHtml(booking.client.nom)} a été refusée et le créneau libéré. Le client vient d'en être informé.`,
  );
}
