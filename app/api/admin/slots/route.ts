import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { newId } from "@/lib/id";
import { HEURES_CRENEAUX } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    action?: string;
    date?: string;
    hour?: number;
    motif?: string;
  };
  const { action, date, hour, motif } = body;
  if (typeof date !== "string") return NextResponse.json({ error: "Date invalide" }, { status: 400 });

  const store = getStore();
  const now = new Date().toISOString();

  switch (action) {
    case "block":
      if (typeof hour !== "number" || !HEURES_CRENEAUX.includes(hour))
        return NextResponse.json({ error: "Créneau invalide" }, { status: 400 });
      await store.createBlocage({ id: newId("blk"), date, hour, motif: motif || "Indisponible", createdAt: now });
      break;
    case "unblock":
      if (typeof hour !== "number") return NextResponse.json({ error: "Créneau invalide" }, { status: 400 });
      await store.deleteBlocageBySlot(date, hour);
      break;
    case "block-day":
      await store.createBlocage({ id: newId("blk"), date, hour: null, motif: motif || "Journée bloquée", createdAt: now });
      break;
    case "unblock-day":
      await store.deleteBlocageBySlot(date, null);
      break;
    default:
      return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
