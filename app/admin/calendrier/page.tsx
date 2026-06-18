import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getAdminDay, isDayBlocked } from "@/lib/scheduling";
import { todayISO } from "@/lib/dates";
import { getStore } from "@/lib/store";
import AdminCalendar from "@/components/admin/AdminCalendar";

export const dynamic = "force-dynamic";

export default async function CalendrierPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  if (!isAuthenticated()) redirect("/admin");

  const today = todayISO();
  const date =
    searchParams.date && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.date) ? searchParams.date : today;

  const [slots, dayBlocked, all] = await Promise.all([
    getAdminDay(date),
    isDayBlocked(date),
    getStore().listBookings(today), // toutes les demandes à partir d'aujourd'hui
  ]);

  const pending = all
    .filter((b) => b.statut === "a_valider")
    .sort((a, b) =>
      (a.date + String(a.hour).padStart(2, "0")).localeCompare(b.date + String(b.hour).padStart(2, "0")),
    );

  return (
    <AdminCalendar date={date} today={today} slots={slots} dayBlocked={dayBlocked} pending={pending} />
  );
}
