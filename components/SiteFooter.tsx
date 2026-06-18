import Link from "next/link";
import { CABINET, HORAIRES_AFFICHAGE } from "@/lib/config";
import { Scale } from "@/components/Icons";

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <Scale className="h-5 w-5 text-accent" />
            <span className="font-display text-lg font-semibold tracking-tight">
              Cabinet NGANGA
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">
            {CABINET.titre}. Défense et conseil pour les particuliers et professionnels en France.
          </p>
        </div>

        <div className="text-sm">
          <h3 className="text-[11px] uppercase tracking-[0.18em] text-ink-soft">Cabinet</h3>
          <address className="mt-3 not-italic leading-relaxed text-ink">
            {CABINET.adresse}
            <br />
            {CABINET.codePostal} {CABINET.ville}
            <br />
            <a href={`tel:${CABINET.telephoneE164}`} className="font-mono hover:text-accent">
              {CABINET.telephone}
            </a>
          </address>
          <div className="mt-3 text-ink-soft">
            {HORAIRES_AFFICHAGE.map((h) => (
              <div key={h.label}>
                {h.label} · {h.plage}
              </div>
            ))}
          </div>
        </div>

        <div className="text-sm">
          <h3 className="text-[11px] uppercase tracking-[0.18em] text-ink-soft">Informations</h3>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/prendre-rdv" className="text-ink hover:text-accent">
                Prendre rendez-vous
              </Link>
            </li>
            <li>
              <Link href="/mentions-legales" className="text-ink-soft hover:text-accent">
                Mentions légales
              </Link>
            </li>
            <li>
              <Link href="/confidentialite" className="text-ink-soft hover:text-accent">
                Politique de confidentialité
              </Link>
            </li>
            <li>
              <Link href="/cgv" className="text-ink-soft hover:text-accent">
                Conditions générales
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-5 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>
            © {new Date().getFullYear()} {CABINET.avocat}. Tous droits réservés.
          </span>
          <span>Avocat inscrit au Barreau de Bobigny.</span>
        </div>
      </div>
    </footer>
  );
}
