// ============================================================
//  Helpers de dates — tout est calé sur Europe/Paris.
//  En local / sur Vercel, définir TZ=Europe/Paris (voir .env.example).
// ============================================================

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function isoInParis(d: Date): string {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const p = Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}

export function todayISO(): string {
  return isoInParis(new Date());
}

export function parseISO(s: string): { y: number; m: number; d: number } {
  const [y, m, d] = s.split("-").map(Number);
  return { y, m, d };
}

function isoFromUTC(dt: Date): string {
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

export function addDaysISO(s: string, n: number): string {
  const { y, m, d } = parseISO(s);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return isoFromUTC(dt);
}

/** 0 = dimanche, 1 = lundi, … (stable, sans dépendance au fuseau) */
export function dayOfWeek(s: string): number {
  const { y, m, d } = parseISO(s);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Instant réel du début de créneau, en heure locale (TZ=Europe/Paris) */
export function slotInstant(date: string, hour: number): Date {
  const { y, m, d } = parseISO(date);
  return new Date(y, m - 1, d, hour, 0, 0, 0);
}

export function isSlotInPast(date: string, hour: number): boolean {
  return slotInstant(date, hour).getTime() <= Date.now();
}

export function isBeforeLead(date: string, hour: number, leadHours: number): boolean {
  return slotInstant(date, hour).getTime() < Date.now() + leadHours * 3600_000;
}

// --- Formatage FR ---
function fmt(date: string, opts: Intl.DateTimeFormatOptions): string {
  const { y, m, d } = parseISO(date);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", ...opts }).format(dt);
}

export function formatDateLong(date: string): string {
  return fmt(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function formatDateShort(date: string): string {
  return fmt(date, { weekday: "short", day: "numeric", month: "short" });
}

export function weekdayShort(date: string): string {
  return fmt(date, { weekday: "short" }).replace(".", "");
}

export function monthShort(date: string): string {
  return fmt(date, { month: "short" }).replace(".", "");
}

export function dayNumber(date: string): number {
  return parseISO(date).d;
}

export function slotLabel(hour: number): string {
  return `${hour}h – ${hour + 1}h`;
}

export function slotStart(hour: number): string {
  return `${hour}h00`;
}
