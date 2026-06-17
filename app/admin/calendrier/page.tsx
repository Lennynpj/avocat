import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getAdminDay, isDayBlocked } from "@/lib/scheduling";
import { todayISO } from "@/lib/dates";
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

  const [slots, dayBlocked] = await Promise.all([getAdminDay(date), isDayBlocked(date)]);

  return <AdminCalendar date={date} today={today} slots={slots} dayBlocked={dayBlocked} />;
}
