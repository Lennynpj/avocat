import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BookingFlow from "@/components/booking/BookingFlow";

export const metadata: Metadata = {
  title: "Prendre rendez-vous",
  description:
    "Demandez un rendez-vous avec Maître Jean Vivien NGANGA, avocat à Clichy-sous-bois (93). Consultation 120 € TTC réglée au cabinet, demande confirmée par le cabinet.",
  alternates: { canonical: "/prendre-rdv" },
};

export default function PrendreRdvPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-5 py-8 sm:px-8 sm:py-12">
        <BookingFlow />
      </main>
      <SiteFooter />
    </>
  );
}
