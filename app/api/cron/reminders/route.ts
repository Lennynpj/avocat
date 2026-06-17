import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { addDaysISO, todayISO } from "@/lib/dates";
import { notifyReminder } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Rappels 24h — appelé par Vercel Cron (voir vercel.json).
async function handle(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    const url = new URL(req.url);
    if (auth !== `Bearer ${secret}` && url.searchParams.get("secret") !== secret) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
  }

  const target = addDaysISO(todayISO(), 1); // les RDV de demain
  const store = getStore();
  const bookings = await store.listBookings(target, target);
  const aRappeler = bookings.filter(
    (b) => !b.rappelEnvoye && ["paye", "a_payer_especes", "confirme"].includes(b.statut),
  );

  for (const b of aRappeler) {
    await notifyReminder(b);
    await store.updateBooking(b.id, { rappelEnvoye: true });
  }

  return NextResponse.json({ date: target, rappels: aRappeler.length });
}

export async function GET(req: Request) {
  return handle(req);
}
export async function POST(req: Request) {
  return handle(req);
}
