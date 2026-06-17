import { JsonFileStore } from "./JsonFileStore";
import { MongoStore } from "./MongoStore";
import { mongoEnabled } from "@/lib/mongo";
import type { BookingStore } from "./BookingStore";

// Singleton. L'implémentation est choisie automatiquement :
//   - MongoStore  si MONGODB_URI est défini (Phase 1 — MongoDB Atlas) ;
//   - JsonFileStore sinon (POC local, fichier data/db.json).
let _store: BookingStore | null = null;

export function getStore(): BookingStore {
  if (!_store) _store = mongoEnabled() ? new MongoStore() : new JsonFileStore();
  return _store;
}

export type { BookingStore };
