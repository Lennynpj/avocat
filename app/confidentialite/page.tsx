import type { Metadata } from "next";
import LegalShell from "@/components/LegalShell";
import { CABINET } from "@/lib/config";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Traitement des données personnelles dans le cadre de la prise de rendez-vous en ligne.",
};

export default function Confidentialite() {
  return (
    <LegalShell title="Politique de confidentialité" updated="juin 2026">
      <p>
        La présente politique décrit le traitement des données personnelles collectées dans le cadre de la prise de
        rendez-vous en ligne, dans le respect du Règlement (UE) 2016/679 (RGPD) et de la loi Informatique et Libertés.
      </p>

      <h2>Responsable de traitement</h2>
      <p>
        {CABINET.avocat}, {CABINET.adresse}, {CABINET.codePostal} {CABINET.ville}. Pour toute demande relative à vos
        données, contactez le cabinet au {CABINET.telephone}.
      </p>

      <h2>Données collectées</h2>
      <ul>
        <li>Identité et contact : nom, prénom, adresse email, numéro de téléphone.</li>
        <li>Rendez-vous : date, créneau, type de rendez-vous et, le cas échéant, nom du dossier en cours.</li>
        <li>
          Paiement : les données bancaires sont collectées et traitées directement par Stripe. Le cabinet n&apos;y a
          jamais accès et n&apos;en conserve aucune.
        </li>
      </ul>

      <h2>Finalités et bases légales</h2>
      <ul>
        <li>Gestion et confirmation des rendez-vous — exécution de mesures précontractuelles.</li>
        <li>Encaissement de la consultation — exécution du contrat.</li>
        <li>Rappels par email et SMS — intérêt légitime du cabinet et du client à honorer le rendez-vous.</li>
        <li>Respect des obligations légales et comptables.</li>
      </ul>

      <h2>Destinataires et sous-traitants</h2>
      <p>Les données sont strictement réservées au cabinet et à ses prestataires techniques :</p>
      <ul>
        <li>Stripe — traitement des paiements par carte.</li>
        <li>Resend — envoi des emails transactionnels.</li>
        <li>smsmode — envoi des SMS de confirmation et de rappel.</li>
        <li>Vercel — hébergement du site.</li>
      </ul>

      <h2>Durée de conservation</h2>
      <p>
        Les données de rendez-vous sont conservées le temps nécessaire au suivi de la relation, puis archivées ou
        supprimées conformément aux obligations légales applicables à la profession.
      </p>

      <h2>Secret professionnel</h2>
      <p>
        Les informations relatives à votre situation sont couvertes par le secret professionnel de l&apos;avocat. Nous
        vous invitons à ne renseigner, dans le champ « nom du dossier », qu&apos;une référence permettant de vous
        identifier, sans détail confidentiel.
      </p>

      <h2>Vos droits</h2>
      <p>
        Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de limitation et
        d&apos;opposition. Vous pouvez les exercer auprès du cabinet. En cas de difficulté, vous pouvez saisir la CNIL
        (
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
          cnil.fr
        </a>
        ).
      </p>

      <h2>Cookies</h2>
      <p>
        Ce site n&apos;utilise pas de cookie de suivi publicitaire. Seul un cookie technique est utilisé pour la
        connexion à l&apos;espace de gestion du cabinet.
      </p>
    </LegalShell>
  );
}
