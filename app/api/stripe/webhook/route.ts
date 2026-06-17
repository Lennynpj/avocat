import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getStore } from "@/lib/store";
import { notifyPaid } from "@/lib/notify";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Stripe non configuré" }, { status: 400 });
  }

  const sig = req.headers.get("stripe-signature");
  const raw = await req.text(); // corps brut requis pour la vérification de signature

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig as string, secret);
  } catch (e) {
    console.error("[webhook] signature invalide", e);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  const store = getStore();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = (session.metadata?.bookingId as string) || "";
    const booking =
      (bookingId && (await store.getBooking(bookingId))) ||
      (await store.getBookingByStripeSession(session.id));
    if (booking && booking.statut !== "paye") {
      const updated = await store.updateBooking(booking.id, {
        statut: "paye",
        stripePaymentIntentId: (session.payment_intent as string) || undefined,
      });
      if (updated) await notifyPaid(updated);
    }
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const pi = charge.payment_intent as string;
    const all = await store.listBookings();
    const booking = all.find((b) => b.stripePaymentIntentId === pi);
    if (booking && booking.statut !== "rembourse") {
      await store.updateBooking(booking.id, { statut: "rembourse" });
    }
  }

  return NextResponse.json({ received: true });
}
