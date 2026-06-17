import type { Metadata } from "next";
import LegalShell from "@/components/LegalShell";
import { CABINET, PRIX_CONSULTATION } from "@/lib/config";

export const metadata: Metadata = {
  title: "Conditions générales",
  description: "Conditions générales applicables à la prise de rendez-vous et au paiement de la consultation.",
};

export default function CGV() {
  return (
    <LegalShell title="Conditions générales" updated="juin 2026">
      <h2>Objet</h2>
      <p>
        Les présentes conditions régissent la réservation et le paiement d&apos;une consultation juridique auprès de{" "}
        {CABINET.avocat}, via le présent site.
      </p>

      <h2>Prestation et prix</h2>
      <p>
        La première consultation, d&apos;une durée d&apos;une heure, est facturée{" "}
        <strong>{PRIX_CONSULTATION} € TTC</strong>. Le rendez-vous de suivi de dossier, réservé aux clients déjà
        suivis par le cabinet, ne donne lieu à aucun paiement en ligne.
      </p>

      <h2>Modalités de paiement</h2>
      <ul>
        <li>Par carte bancaire au moment de la réservation, via un paiement sécurisé opéré par Stripe.</li>
        <li>En espèces, à régler directement au cabinet le jour du rendez-vous.</li>
      </ul>

      <h2>Réservation</h2>
      <p>
        La réservation d&apos;un créneau le rend indisponible pour les autres clients. Pour un paiement par carte, le
        rendez-vous est confirmé dès réception du paiement. Pour un paiement en espèces, la confirmation est adressée
        par email et SMS.
      </p>

      <h2>Annulation et remboursement</h2>
      <p>
        En cas d&apos;empêchement, le client est invité à prévenir le cabinet au plus tôt au {CABINET.telephone}. En
        cas d&apos;annulation, le cabinet procède au remboursement intégral de la consultation réglée par carte. Le
        remboursement est émis sous quelques jours sur le moyen de paiement initial.
      </p>

      <h2>Retard ou absence</h2>
      <p>
        En cas de retard, la durée de la consultation pourra être réduite. <strong>[Politique en cas d&apos;absence non
        prévenue à préciser par le cabinet.]</strong>
      </p>

      <h2>Réclamations et médiation</h2>
      <p>
        Toute réclamation peut être adressée au cabinet. À défaut de résolution amiable, le client consommateur peut
        recourir gratuitement au médiateur de la consommation de la profession d&apos;avocat (voir les mentions
        légales).
      </p>
    </LegalShell>
  );
}
