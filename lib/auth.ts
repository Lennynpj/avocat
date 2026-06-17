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
