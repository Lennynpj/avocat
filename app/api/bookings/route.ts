import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { isSlotBookable } from "@/lib/scheduling";
import { newId } from "@/lib/id";
import { getStripe, stripeEnabled, siteUrl } from "@/lib/stripe";
import { notifyBookingCreated, notifyPaid } from "@/lib/notify";
import { PRIX_CONSULTATION, DEVISE } from "@/lib/config";
import type { Booking } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return bad("Requête invalide.");
  }

  const type = body.type;
  const date = body.date;
  const hour = body.hour;
  const client = body.client as { nom?: string; email?: string; telephone?: string } | undefined;
  const dossier = body.dossier;

  if (type !== "consultation" && type !== "suivi_dossier") return bad("Type de rendez-vous invalide.");
  if (typeof date !== "string" || typeof hour !== "number") return bad("Créneau invalide.");
  if (!client || !client.nom || !client.email || !client.telephone) return bad("Coordonnées incomplètes.");
  if (client.nom.trim().length < 2) return bad("Nom invalide.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) return bad("Email invalide.");
  if (type === "suivi_dossier" && (typeof dossier !== "string" || dossier.trim().length < 2))
    return bad("Nom du dossier requis.");

  const mode = type === "suivi_dossier" ? "aucun" : (body.paiement as string);
  if (type === "consultation" && mode !== "cb" && mode !== "especes") return bad("Mode de paiement invalide.");

  // Anti double-réservation : on revérifie côté serveur.
  const dispo = await isSlotBookable(date, hour);
  if (!dispo) return bad("Ce créneau n'est plus disponible. Choisissez-en un autre.", 409);

  const store = getStore();
  const montant = type === "suivi_dossier" ? 0 : PRIX_CONSULTATION;

  let statut: Booking["statut"];
  if (type === "suivi_dossier") statut = "confirme";
  else if (mode === "especes") statut = "a_payer_especes";
  else statut = stripeEnabled() ? "en_attente" : "paye"; // pas de Stripe en local → on simule un paiement réussi

  const booking: Booking = {
    id: newId("rdv"),
    date,
    hour,
    type,
    paiement: mode as Booking["paiement"],
    statut,
    client: {
      nom: client.nom.trim(),
      email: client.email.trim(),
      telephone: client.telephone.trim(),
    },
    dossier: type === "suivi_dossier" ? String(dossier).trim() : undefined,
    montant,
    source: "en_ligne",
    rappelEnvoye: false,
    createdAt: new Date().toISOString(),
  };

  // --- Carte bancaire avec Stripe configuré : redirection Checkout ---
  if (type === "consultation" && mode === "cb" && stripeEnabled()) {
    const stripe = getStripe()!;
    await store.createBooking(booking);
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        locale: "fr",
        customer_email: booking.client.email,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: DEVISE,
              unit_amount: montant * 100,
              product_data: { name: "Première consultation — Cabinet NGANGA" },
            },
          },
        ],
        metadata: { bookingId: booking.id },
        success_url: `${siteUrl()}/confirmation?id=${booking.id}`,
        cancel_url: `${siteUrl()}/prendre-rdv?canceled=1`,
        expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
      });
      await store.updateBooking(booking.id, { stripeSessionId: session.id });
      return NextResponse.json({ url: session.url });
    } catch (e) {
      console.error("[Stripe session]", e);
      await store.updateBooking(booking.id, { statut: "annule" });
      return bad("Le paiement n'a pas pu être initialisé. Réessayez.", 502);
    }
  }

  // --- Espèces, suivi de dossier, ou CB simulée en local ---
  await store.createBooking(booking);
  if (booking.statut === "paye") {
    await notifyPaid(booking);
  } else {
    await notifyBookingCreated(booking);
  }

  const simule = type === "consultation" && mode === "cb" ? "&simule=1" : "";
  return NextResponse.json({ redirect: `/confirmation?id=${booking.id}${simule}` });
}
