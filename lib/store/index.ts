import { JsonFileStore } from "./JsonFileStore";
import type { BookingStore } from "./BookingStore";

// Singleton. Pour passer en Phase 1 :
//   import { PostgresStore } from "./PostgresStore";
//   _store = new PostgresStore();
// Rien d'autre à changer dans l'app.
let _store: BookingStore | null = null;

export function getStore(): BookingStore {
  if (!_store) _store = new JsonFileStore();
  return _store;
}

export type { BookingStore };
