import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getMonthMarks } from "@/lib/scheduling";
import { todayISO } from "@/lib/dates";
import AdminMonth from "@/components/admin/AdminMonth";

export const dynamic = "force-dynamic";

export default async function MoisPage({
  searchParams,
}: {
  searchParams: { m?: string };
}) {
  if (!isAuthenticated()) redirect("/admin");

  const today = todayISO();
  const month = searchParams.m && /^\d{4}-\d{2}$/.test(searchParams.m) ? searchParams.m : today.slice(0, 7);
  const marks = await getMonthMarks(month);

  return <AdminMonth month={month} today={today} marks={marks} />;
}
