import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { isSlotBookable } from "@/lib/scheduling";
import { newId } from "@/lib/id";
import { notifyRequestReceived } from "@/lib/notify";
import { PRIX_CONSULTATION } from "@/lib/config";
import type { Booking } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

// Demande de rendez-vous en ligne (sans paiement) → statut « à valider » par l'avocat.
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

  // Anti double-réservation : revérification côté serveur.
  const dispo = await isSlotBookable(date, hour);
  if (!dispo) return bad("Ce créneau n'est plus disponible. Choisissez-en un autre.", 409);

  const consultation = type === "consultation";
  const booking: Booking = {
    id: newId("rdv"),
    date,
    hour,
    // « especes » = à régler au cabinet (consultation) ; « aucun » = suivi sans frais.
    paiement: consultation ? "especes" : "aucun",
    type,
    statut: "a_valider", // demande à confirmer par l'avocat
    client: {
      nom: client.nom.trim(),
      email: client.email.trim(),
      telephone: client.telephone.trim(),
    },
    dossier: type === "suivi_dossier" ? String(dossier).trim() : undefined,
    montant: consultation ? PRIX_CONSULTATION : 0,
    source: "en_ligne",
    rappelEnvoye: false,
    createdAt: new Date().toISOString(),
  };

  await getStore().createBooking(booking);
  await notifyRequestReceived(booking);

  return NextResponse.json({ redirect: `/confirmation?id=${booking.id}` });
}
