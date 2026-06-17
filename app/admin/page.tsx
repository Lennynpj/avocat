import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import AdminLogin from "@/components/admin/AdminLogin";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  if (isAuthenticated()) redirect("/admin/calendrier");
  return <AdminLogin />;
}
