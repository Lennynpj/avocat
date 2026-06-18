import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Check, Cash, Clock, ArrowRight, FileText } from "@/components/Icons";
import { getStore } from "@/lib/store";
import { formatDateLong, slotStart } from "@/lib/dates";
import { CABINET, PRIX_CONSULTATION } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Confirmation", robots: { index: false } };

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const id = searchParams.id;
  const booking = id ? await getStore().getBooking(id) : null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-5 py-12 sm:px-8 sm:py-16">
        {!booking ? (
          <div className="text-center">
            <h1 className="font-display text-2xl font-semibold">Rendez-vous introuvable</h1>
            <p className="mt-3 text-ink-soft">
              Nous n&apos;avons pas retrouvé ce rendez-vous. Contactez le cabinet au {CABINET.telephone}.
            </p>
            <Link href="/prendre-rdv" className="mt-6 inline-flex items-center gap-2 text-accent">
              Reprendre <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-white">
                <Check className="h-8 w-8" />
              </div>
              <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">
                {booking.statut === "a_valider" ? "Demande envoyée" : "Rendez-vous confirmé"}
              </h1>
              <p className="mt-3 max-w-sm text-ink-soft">
                {booking.statut === "a_valider"
                  ? "Votre demande a bien été enregistrée. Le cabinet va la confirmer — vous recevrez un email et un SMS dès validation."
                  : "Votre rendez-vous est confirmé. Un email et un SMS vous ont été envoyés."}
              </p>
            </div>

            <div className="mt-9 overflow-hidden rounded-2xl border border-line bg-surface">
              <DetailRow label="Date">{formatDateLong(booking.date)}</DetailRow>
              <DetailRow label="Heure">{slotStart(booking.hour)}</DetailRow>
              <DetailRow label="Type">
                {booking.type === "consultation" ? "Rendez-vous (exposé de situation)" : "Suivi de dossier"}
              </DetailRow>
              {booking.dossier && <DetailRow label="Dossier">{booking.dossier}</DetailRow>}
              <DetailRow label="Au nom de">{booking.client.nom}</DetailRow>

              {booking.type === "consultation" && (
                <div className="flex items-center gap-3 bg-accent/5 px-5 py-4">
                  <Cash className="h-5 w-5 text-accent" />
                  <div className="text-sm">
                    <p className="font-semibold text-accent">Consultation · {PRIX_CONSULTATION} € TTC</p>
                    <p className="text-ink-soft">À régler au cabinet le jour du rendez-vous.</p>
                  </div>
                </div>
              )}
              {booking.type === "suivi_dossier" && (
                <div className="flex items-center gap-3 bg-surface px-5 py-4 text-sm text-ink-soft">
                  <FileText className="h-5 w-5 text-ink" /> Rendez-vous de suivi — sans frais.
                </div>
              )}
            </div>

            <div className="mt-7 rounded-2xl border border-line bg-paper px-5 py-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Clock className="h-4 w-4 text-accent" /> La suite
              </h2>
              <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
                {booking.statut === "a_valider" ? (
                  <>
                    <li>· Le cabinet confirme votre demande sous peu.</li>
                    <li>· Vous recevrez un email et un SMS dès validation.</li>
                  </>
                ) : (
                  <li>· Un rappel vous sera envoyé par email et SMS la veille du rendez-vous.</li>
                )}
                <li>· Cabinet : {CABINET.adresse}, {CABINET.codePostal} {CABINET.ville}.</li>
                <li>· Pour toute question, appelez le {CABINET.telephone}.</li>
              </ul>
            </div>

            <div className="mt-8 text-center">
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-strong">
                Retour à l&apos;accueil <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
      <span className="text-sm text-ink-soft">{label}</span>
      <span className="text-right text-sm font-medium text-ink">{children}</span>
    </div>
  );
}
