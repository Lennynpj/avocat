import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { getAdminDay } from "@/lib/scheduling";
import { newId } from "@/lib/id";
import { HEURES_CRENEAUX, PRIX_CONSULTATION } from "@/lib/config";
import type { Booking } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Réservation prise par téléphone côté cabinet — bloque le créneau sur le site.
export async function POST(req: Request) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    date?: string;
    hour?: number;
    type?: string;
    paiement?: string;
    client?: { nom?: string; telephone?: string; email?: string };
    dossier?: string;
  };
  const { date, hour, type, paiement, client, dossier } = body;

  if (type !== "consultation" && type !== "suivi_dossier")
    return NextResponse.json({ error: "Type invalide" }, { status: 400 });
  if (typeof date !== "string" || typeof hour !== "number" || !HEURES_CRENEAUX.includes(hour))
    return NextResponse.json({ error: "Créneau invalide" }, { status: 400 });
  if (!client || !client.nom || client.nom.trim().length < 2)
    return NextResponse.json({ error: "Nom du client requis" }, { status: 400 });

  // Le créneau doit être libre dans la vue admin.
  const day = await getAdminDay(date);
  const slot = day.find((s) => s.hour === hour);
  if (!slot || slot.state !== "libre")
    return NextResponse.json({ error: "Ce créneau n'est pas libre." }, { status: 409 });

  let statut: Booking["statut"];
  let mode: Booking["paiement"];
  if (type === "suivi_dossier") {
    statut = "confirme";
    mode = "aucun";
  } else if (paiement === "paye") {
    statut = "paye";
    mode = "especes";
  } else {
    statut = "a_payer_especes";
    mode = "especes";
  }

  const booking: Booking = {
    id: newId("rdv"),
    date,
    hour,
    type,
    paiement: mode,
    statut,
    client: {
      nom: client.nom.trim(),
      email: client.email?.trim() || "",
      telephone: client.telephone?.trim() || "",
    },
    dossier: type === "suivi_dossier" ? dossier?.trim() || undefined : undefined,
    montant: type === "suivi_dossier" ? 0 : PRIX_CONSULTATION,
    source: "telephone",
    rappelEnvoye: false,
    createdAt: new Date().toISOString(),
  };

  await getStore().createBooking(booking);
  return NextResponse.json({ ok: true, booking });
}
