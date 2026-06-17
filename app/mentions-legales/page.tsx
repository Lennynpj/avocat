import type { Metadata } from "next";
import LegalShell from "@/components/LegalShell";
import { CABINET } from "@/lib/config";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du cabinet de Maître Jean Vivien NGANGA.",
};

export default function MentionsLegales() {
  return (
    <LegalShell title="Mentions légales" updated="juin 2026">
      <h2>Éditeur du site</h2>
      <p>
        {CABINET.avocat}, avocat inscrit au Barreau de Bobigny, exerçant à titre individuel.
        <br />
        {CABINET.adresse}, {CABINET.codePostal} {CABINET.ville}.
        <br />
        Téléphone : {CABINET.telephone}.
      </p>
      <p>
        Numéro SIREN : <strong>[À compléter]</strong> · TVA intracommunautaire : <strong>[À compléter]</strong>.
      </p>

      <h2>Directeur de la publication</h2>
      <p>{CABINET.avocat}.</p>

      <h2>Profession réglementée</h2>
      <p>
        La profession d&apos;avocat est réglementée. {CABINET.avocat} est soumis aux règles déontologiques de la
        profession et relève de l&apos;Ordre des avocats du Barreau de Bobigny. Les règles professionnelles
        applicables sont consultables sur le site du Conseil National des Barreaux (
        <a href="https://www.cnb.avocat.fr" target="_blank" rel="noopener noreferrer">
          cnb.avocat.fr
        </a>
        ).
      </p>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis (
        <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">
          vercel.com
        </a>
        ).
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des contenus de ce site (textes, éléments graphiques, mise en forme) est protégé. Toute
        reproduction, totale ou partielle, sans autorisation préalable est interdite.
      </p>

      <h2>Médiation de la consommation</h2>
      <p>
        Conformément aux articles L.612-1 et suivants du Code de la consommation, le client peut recourir au
        médiateur de la consommation de la profession d&apos;avocat : <strong>[Nom et coordonnées du médiateur à
        compléter]</strong>.
      </p>
    </LegalShell>
  );
}
