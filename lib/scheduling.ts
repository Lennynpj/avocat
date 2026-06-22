import { getStore } from "@/lib/store";
import {
  HEURES_CRENEAUX,
  JOURS_OUVRES,
  DELAI_MIN_HEURES,
  HORIZON_JOURS,
  HOLD_PENDING_MIN,
} from "@/lib/config";
import type { Booking, Blocage, AdminSlot, SlotState } from "@/lib/types";
import {
  todayISO,
  addDaysISO,
  dayOfWeek,
  isSlotInPast,
  isBeforeLead,
} from "@/lib/dates";

/** Un RDV occupe-t-il réellement le créneau ? (les "en_attente" trop vieux le libèrent) */
export function bookingOccupies(b: Booking): boolean {
  if (
    b.statut === "a_valider" ||
    b.statut === "paye" ||
    b.statut === "a_payer_especes" ||
    b.statut === "confirme"
  ) {
    return true;
  }
  if (b.statut === "en_attente") {
    const age = Date.now() - new Date(b.createdAt).getTime();
    return age < HOLD_PENDING_MIN * 60_000;
  }
  return false; // annule, rembourse
}

export function isWorkingDay(date: string): boolean {
  return JOURS_OUVRES.includes(dayOfWeek(date));
}

function isBlocked(blocages: Blocage[], date: string, hour: number): boolean {
  return blocages.some((b) => b.date === date && (b.hour === null || b.hour === hour));
}

function takenBy(bookings: Booking[], date: string, hour: number): Booking | undefined {
  return bookings.find((b) => b.date === date && b.hour === hour && bookingOccupies(b));
}

export interface DayAvailability {
  date: string;
  hours: number[]; // heures encore réservables
}

/** Disponibilités publiques sur l'horizon de réservation. */
export async function getPublicAvailability(
  horizonDays: number = HORIZON_JOURS,
): Promise<DayAvailability[]> {
  const store = getStore();
  const from = todayISO();
  const to = addDaysISO(from, horizonDays);
  const [bookings, blocages] = await Promise.all([
    store.listBookings(from, to),
    store.listBlocages(from, to),
  ]);

  const days: DayAvailability[] = [];
  for (let i = 0; i <= horizonDays; i++) {
    const date = addDaysISO(from, i);
    if (!isWorkingDay(date)) continue;
    const hours = HEURES_CRENEAUX.filter(
      (h) =>
        !isSlotInPast(date, h) &&
        !isBeforeLead(date, h, DELAI_MIN_HEURES) &&
        !isBlocked(blocages, date, h) &&
        !takenBy(bookings, date, h),
    );
    if (hours.length > 0) days.push({ date, hours });
  }
  return days;
}

/** Un créneau précis est-il réservable en ligne (revérifié à la création) ? */
export async function isSlotBookable(date: string, hour: number): Promise<boolean> {
  if (!HEURES_CRENEAUX.includes(hour)) return false;
  if (!isWorkingDay(date)) return false;
  if (isSlotInPast(date, hour)) return false;
  if (isBeforeLead(date, hour, DELAI_MIN_HEURES)) return false;
  const store = getStore();
  const [bookings, blocages] = await Promise.all([
    store.listBookings(date, date),
    store.listBlocages(date, date),
  ]);
  if (isBlocked(blocages, date, hour)) return false;
  if (takenBy(bookings, date, hour)) return false;
  return true;
}

function stateOf(booking?: Booking): SlotState {
  if (!booking) return "libre";
  switch (booking.statut) {
    case "a_valider":
      return "a_valider";
    case "paye":
      return "paye";
    case "a_payer_especes":
      return "especes";
    case "confirme":
      return "suivi";
    case "en_attente":
      return "en_attente";
    default:
      return "libre";
  }
}

/** Vue admin d'une journée : les 7 créneaux avec leur état. */
export async function getAdminDay(date: string): Promise<AdminSlot[]> {
  const store = getStore();
  const [bookings, blocages] = await Promise.all([
    store.listBookings(date, date),
    store.listBlocages(date, date),
  ]);

  return HEURES_CRENEAUX.map((hour) => {
    if (isBlocked(blocages, date, hour)) {
      const blocage =
        blocages.find((b) => b.date === date && b.hour === hour) ??
        blocages.find((b) => b.date === date && b.hour === null);
      return { date, hour, state: "bloque" as SlotState, blocage };
    }
    const booking = takenBy(bookings, date, hour);
    return { date, hour, state: stateOf(booking), booking };
  });
}

/** La journée entière est-elle bloquée ? */
export async function isDayBlocked(date: string): Promise<boolean> {
  const store = getStore();
  const blocages = await store.listBlocages(date, date);
  return blocages.some((b) => b.hour === null);
}

/** Repères du mois pour la vue calendrier : par jour, nb de RDV + présence d'une audience/blocage. */
export async function getMonthMarks(
  monthISO: string,
): Promise<Record<string, { rdv: number; audience: boolean }>> {
  const [y, m] = monthISO.split("-").map(Number);
  const from = `${monthISO}-01`;
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const to = `${monthISO}-${String(lastDay).padStart(2, "0")}`;

  const store = getStore();
  const [bookings, blocages] = await Promise.all([
    store.listBookings(from, to),
    store.listBlocages(from, to),
  ]);

  const marks: Record<string, { rdv: number; audience: boolean }> = {};
  const at = (d: string) => (marks[d] ??= { rdv: 0, audience: false });
  for (const b of bookings) if (bookingOccupies(b)) at(b.date).rdv += 1;
  for (const bl of blocages) at(bl.date).audience = true;
  return marks;
}
