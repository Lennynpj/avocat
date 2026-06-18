import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { notifyRefund, notifyValidated, notifyDeclined } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { action } = (await req.json().catch(() => ({}))) as { action?: string };
  const store = getStore();
  const booking = await store.getBooking(params.id);
  if (!booking) return NextResponse.json({ error: "Rendez-vous introuvable" }, { status: 404 });

  switch (action) {
    case "refund": {
      if (booking.stripePaymentIntentId && stripeEnabled()) {
        try {
          await getStripe()!.refunds.create({ payment_intent: booking.stripePaymentIntentId });
        } catch (e) {
          console.error("[refund Stripe]", e);
          return NextResponse.json({ error: "Le remboursement Stripe a échoué." }, { status: 502 });
        }
      }
      const updated = await store.updateBooking(params.id, { statut: "rembourse" });
      if (updated) await notifyRefund(updated);
      break;
    }
    case "validate": {
      if (booking.statut !== "a_valider") break;
      const statut = booking.type === "consultation" ? "a_payer_especes" : "confirme";
      const updated = await store.updateBooking(params.id, { statut });
      if (updated) await notifyValidated(updated);
      break;
    }
    case "decline": {
      if (booking.statut !== "a_valider") break;
      const updated = await store.updateBooking(params.id, { statut: "annule" });
      if (updated) await notifyDeclined(updated);
      break;
    }
    case "cancel":
      await store.updateBooking(params.id, { statut: "annule" });
      break;
    case "mark-paid":
      await store.updateBooking(params.id, { statut: "paye" });
      break;
    default:
      return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
