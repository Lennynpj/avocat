import type { Booking, Blocage } from "@/lib/types";
import type { BookingStore } from "./BookingStore";
import { getDb } from "@/lib/mongo";

// On retire toujours le `_id` Mongo : il n'est pas dans nos types et n'est pas
// sérialisable vers les Client Components (admin).
const NO_ID = { projection: { _id: 0 } };

function dateRange(from?: string, to?: string): Record<string, unknown> {
  if (!from && !to) return {};
  const r: Record<string, string> = {};
  if (from) r.$gte = from;
  if (to) r.$lte = to;
  return { date: r };
}

export class MongoStore implements BookingStore {
  private async col(name: string) {
    return (await getDb()).collection(name);
  }

  async getBooking(id: string): Promise<Booking | null> {
    const c = await this.col("bookings");
    return (await c.findOne({ id }, NO_ID)) as unknown as Booking | null;
  }

  async getBookingByStripeSession(sessionId: string): Promise<Booking | null> {
    const c = await this.col("bookings");
    return (await c.findOne({ stripeSessionId: sessionId }, NO_ID)) as unknown as Booking | null;
  }

  async listBookings(fromISO?: string, toISO?: string): Promise<Booking[]> {
    const c = await this.col("bookings");
    const arr = (await c.find(dateRange(fromISO, toISO), NO_ID).toArray()) as unknown as Booking[];
    return arr.sort((a, b) => (a.date + a.hour).localeCompare(b.date + b.hour));
  }

  async listBlocages(fromISO?: string, toISO?: string): Promise<Blocage[]> {
    const c = await this.col("blocages");
    return (await c.find(dateRange(fromISO, toISO), NO_ID).toArray()) as unknown as Blocage[];
  }

  async createBooking(b: Booking): Promise<Booking> {
    const c = await this.col("bookings");
    await c.insertOne({ ...b });
    return b;
  }

  async updateBooking(id: string, patch: Partial<Booking>): Promise<Booking | null> {
    const c = await this.col("bookings");
    const { id: _drop, ...set } = patch;
    const doc = await c.findOneAndUpdate(
      { id },
      { $set: set },
      { returnDocument: "after", projection: { _id: 0 } },
    );
    return (doc as unknown as Booking | null) ?? null;
  }

  async createBlocage(b: Blocage): Promise<Blocage> {
    const c = await this.col("blocages");
    await c.insertOne({ ...b });
    return b;
  }

  async deleteBlocage(id: string): Promise<boolean> {
    const c = await this.col("blocages");
    const r = await c.deleteOne({ id });
    return r.deletedCount > 0;
  }

  async deleteBlocageBySlot(date: string, hour: number | null): Promise<boolean> {
    const c = await this.col("blocages");
    const r = await c.deleteMany({ date, hour });
    return r.deletedCount > 0;
  }
}
