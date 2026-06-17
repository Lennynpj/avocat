import { promises as fs } from "fs";
import path from "path";
import type { Booking, Blocage, DB } from "@/lib/types";
import type { BookingStore } from "./BookingStore";

const FILE = path.join(process.cwd(), "data", "db.json");

// Mutex en mémoire (1 instance) : sérialise les écritures pour éviter
// les pertes lors d'un read-modify-write concurrent.
let queue: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function read(): Promise<DB> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const db = JSON.parse(raw) as DB;
    db.bookings = db.bookings ?? [];
    db.blocages = db.blocages ?? [];
    return db;
  } catch {
    return { bookings: [], blocages: [] };
  }
}

async function write(db: DB): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(db, null, 2), "utf8");
}

function inRange(date: string, from?: string, to?: string): boolean {
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

export class JsonFileStore implements BookingStore {
  async getBooking(id: string): Promise<Booking | null> {
    const db = await read();
    return db.bookings.find((b) => b.id === id) ?? null;
  }

  async getBookingByStripeSession(sessionId: string): Promise<Booking | null> {
    const db = await read();
    return db.bookings.find((b) => b.stripeSessionId === sessionId) ?? null;
  }

  async listBookings(fromISO?: string, toISO?: string): Promise<Booking[]> {
    const db = await read();
    return db.bookings
      .filter((b) => inRange(b.date, fromISO, toISO))
      .sort((a, b) => (a.date + a.hour).localeCompare(b.date + b.hour));
  }

  async listBlocages(fromISO?: string, toISO?: string): Promise<Blocage[]> {
    const db = await read();
    return db.blocages.filter((b) => inRange(b.date, fromISO, toISO));
  }

  createBooking(b: Booking): Promise<Booking> {
    return withLock(async () => {
      const db = await read();
      db.bookings.push(b);
      await write(db);
      return b;
    });
  }

  updateBooking(id: string, patch: Partial<Booking>): Promise<Booking | null> {
    return withLock(async () => {
      const db = await read();
      const i = db.bookings.findIndex((b) => b.id === id);
      if (i === -1) return null;
      db.bookings[i] = { ...db.bookings[i], ...patch, id };
      await write(db);
      return db.bookings[i];
    });
  }

  createBlocage(b: Blocage): Promise<Blocage> {
    return withLock(async () => {
      const db = await read();
      db.blocages.push(b);
      await write(db);
      return b;
    });
  }

  deleteBlocage(id: string): Promise<boolean> {
    return withLock(async () => {
      const db = await read();
      const before = db.blocages.length;
      db.blocages = db.blocages.filter((b) => b.id !== id);
      await write(db);
      return db.blocages.length < before;
    });
  }

  deleteBlocageBySlot(date: string, hour: number | null): Promise<boolean> {
    return withLock(async () => {
      const db = await read();
      const before = db.blocages.length;
      db.blocages = db.blocages.filter((b) => !(b.date === date && b.hour === hour));
      await write(db);
      return db.blocages.length < before;
    });
  }
}
