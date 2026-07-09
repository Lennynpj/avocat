import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "cab_admin";

function secret(): string {
  return process.env.SESSION_SECRET || "dev-secret-a-changer";
}
function password(): string {
  return process.env.ADMIN_PASSWORD || "cabinet93";
}

export function expectedToken(): string {
  return createHmac("sha256", secret()).update(`admin:${password()}`).digest("hex");
}

export function checkPassword(pw: string): boolean {
  const a = Buffer.from(pw);
  const b = Buffer.from(password());
  return a.length === b.length && timingSafeEqual(a, b);
}

/** À utiliser dans les Server Components / route handlers (lecture du cookie). */
export function isAuthenticated(): boolean {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  return !!token && token === expectedToken();
}

// ---- Lien 1-clic « Confirmer / Refuser » envoyé à l'avocat par email (sans login) ----
export function rdvActionToken(id: string, action: "oui" | "non"): string {
  return createHmac("sha256", secret()).update(`rdv:${id}:${action}`).digest("hex");
}

export function verifyRdvActionToken(id: string, action: string, token: string): boolean {
  if (action !== "oui" && action !== "non") return false;
  const expected = rdvActionToken(id, action);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// ---- Lien de consultation « Accepter / Refuser » envoyé à l'avocat par SMS ----
export function rdvViewToken(id: string): string {
  return createHmac("sha256", secret()).update(`rdv:${id}:view`).digest("hex");
}

export function verifyRdvViewToken(id: string, token: string): boolean {
  const expected = rdvViewToken(id);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
