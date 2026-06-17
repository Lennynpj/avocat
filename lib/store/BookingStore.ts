import type { Booking, Blocage } from "@/lib/types";

// ============================================================
//  Interface de persistance — TOUTE la donnée passe par ici.
//  Impl POC : JsonFileStore.  Impl Phase 1 : PostgresStore.
//  Changer d'implémentation = changer une seule ligne dans index.ts.
// ============================================================

export interface BookingStore {
  // Lecture
  getBooking(id: string): Promise<Booking | null>;
  getBookingByStripeSession(sessionId: string): Promise<Booking | null>;
  listBookings(fromISO?: string, toISO?: string): Promise<Booking[]>;
  listBlocages(fromISO?: string, toISO?: string): Promise<Blocage[]>;

  // Écriture
  createBooking(b: Booking): Promise<Booking>;
  updateBooking(id: string, patch: Partial<Booking>): Promise<Booking | null>;
  createBlocage(b: Blocage): Promise<Blocage>;
  deleteBlocage(id: string): Promise<boolean>;
  deleteBlocageBySlot(date: string, hour: number | null): Promise<boolean>;
}
