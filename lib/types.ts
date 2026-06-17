// ============================================================
//  Modèle de données
// ============================================================

export type BookingType = "consultation" | "suivi_dossier";

export type PaiementMode = "cb" | "especes" | "aucun";

export type BookingStatus =
  | "en_attente" // CB : créneau réservé, paiement en cours
  | "paye" // CB réglé (ou marqué payé par l'admin)
  | "a_payer_especes" // espèces : à régler au cabinet
  | "confirme" // suivi de dossier : sans paiement
  | "annule"
  | "rembourse";

export type BookingSource = "en_ligne" | "telephone";

export interface Client {
  nom: string;
  email: string;
  telephone: string;
}

export interface Booking {
  id: string;
  date: string; // "YYYY-MM-DD" (Europe/Paris)
  hour: number; // heure de début, ex. 10
  type: BookingType;
  paiement: PaiementMode;
  statut: BookingStatus;
  client: Client;
  dossier?: string; // nom/référence du dossier (suivi)
  montant: number; // € TTC (0 pour un suivi)
  source: BookingSource;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  rappelEnvoye: boolean;
  createdAt: string; // ISO
}

export interface Blocage {
  id: string;
  date: string; // "YYYY-MM-DD"
  hour: number | null; // null = journée entière (audience)
  motif?: string;
  createdAt: string;
}

export interface DB {
  bookings: Booking[];
  blocages: Blocage[];
}

// Un créneau tel qu'exposé au public
export interface Slot {
  date: string;
  hour: number;
  available: boolean;
}

// Vue admin d'un créneau
export type SlotState = "libre" | "paye" | "especes" | "suivi" | "en_attente" | "bloque";

export interface AdminSlot {
  date: string;
  hour: number;
  state: SlotState;
  booking?: Booking;
  blocage?: Blocage;
}
