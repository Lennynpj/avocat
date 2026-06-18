import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getStore } from "@/lib/store";
import AdminPaiements from "@/components/admin/AdminPaiements";

export const dynamic = "force-dynamic";

export default async function PaiementsPage() {
  if (!isAuthenticated()) redirect("/admin");

  const bookings = await getStore().listBookings();
  return <AdminPaiements bookings={bookings} />;
}
