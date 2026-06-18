import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Reveal from "@/components/Reveal";
import { ArrowRight, Phone, MapPin, Clock, Scale } from "@/components/Icons";
import { CABINET, PRIX_CONSULTATION, HORAIRES_AFFICHAGE } from "@/lib/config";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${CABINET.adresse}, ${CABINET.codePostal} ${CABINET.ville}`,
)}`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Attorney",
  name: CABINET.avocat,
  description:
    "Avocat au Barreau de Bobigny. Droit pénal, droit des étrangers, droit de la famille et droit du travail à Clichy-sous-bois.",
  telephone: CABINET.telephoneE164,
  priceRange: "€€",
  areaServed: ["France", "Clichy-sous-bois", "Bobigny", "Seine-Saint-Denis", "Île-de-France"],
  knowsAbout: CABINET.domaines.map((d) => d.titre),
  address: {
    "@type": "PostalAddress",
    streetAddress: CABINET.adresse,
    addressLocality: CABINET.ville,
    postalCode: CABINET.codePostal,
    addressCountry: "FR",
  },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "10:00", closes: "14:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "15:00", closes: "18:00" },
  ],
};

const STEPS = [
  { t: "Choisir un créneau", d: "Le jour et l'heure parmi les disponibilités réelles du cabinet." },
  { t: "Le cabinet confirme", d: "Votre demande est validée par le cabinet ; vous recevez un email et un SMS." },
  {
    t: "Régler au cabinet",
    d: `La consultation (${PRIX_CONSULTATION} € TTC) se règle sur place, le jour du rendez-vous.`,
  },
];

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />

      <main>
        {/* ---------- HERO — papier à en-tête ---------- */}
        <section className="relative isolate">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[460px] bg-[radial-gradient(58%_100%_at_50%_0%,rgba(140,109,52,0.07),transparent_72%)]"
          />
          <div className="mx-auto max-w-3xl px-5 pb-14 pt-16 text-center sm:px-8 sm:pt-24">
            <div className="reveal flex justify-center" style={{ ["--i" as string]: 0 }}>
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full text-accent ring-1 ring-accent/30 after:absolute after:inset-[7px] after:rounded-full after:ring-1 after:ring-accent/15">
                <Scale className="h-7 w-7" />
              </span>
            </div>
            <p
              className="reveal mt-7 flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.28em] text-accent"
              style={{ ["--i" as string]: 1 }}
            >
              <span className="hidden h-px w-6 bg-accent/40 sm:block" />
              Avocat au Barreau de Bobigny · depuis 2000
              <span className="hidden h-px w-6 bg-accent/40 sm:block" />
            </p>
            <h1
              className="reveal mt-6 font-display text-[2.7rem] font-semibold leading-[1.02] tracking-tight text-ink sm:text-[4.2rem]"
              style={{ ["--i" as string]: 2 }}
            >
              Maître Jean&nbsp;Vivien
              <br className="hidden sm:block" /> NGANGA
            </h1>
            <p
              className="reveal mx-auto mt-7 max-w-xl text-lg leading-relaxed text-ink-soft text-pretty"
              style={{ ["--i" as string]: 3 }}
            >
              Docteur en droit. Défense et conseil en droit pénal, droit des étrangers, droit de la famille et droit du
              travail, à Clichy-sous-bois.
            </p>
            <div className="reveal mt-9 flex flex-wrap items-center justify-center gap-3" style={{ ["--i" as string]: 4 }}>
              <CtaPrimary />
              <PhoneBtn />
            </div>
          </div>

          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <div
              className="reveal flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 border-y border-line py-4 text-center font-mono text-xs text-ink-soft"
              style={{ ["--i" as string]: 5 }}
            >
              <span>Clichy-sous-bois (93)</span>
              <span className="text-line">/</span>
              <span>Lun–Ven · 10h–14h · 15h–18h</span>
              <span className="text-line">/</span>
              <span>Consultation {PRIX_CONSULTATION} € TTC</span>
            </div>
          </div>
        </section>

        {/* ---------- I · DOMAINES ---------- */}
        <section id="domaines">
          <Reveal className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
            <SectionHead index="I" title="Domaines d'intervention" />
            <div className="mt-12 divide-y divide-line border-y border-line">
              {CABINET.domaines.map((d, i) => (
                <div
                  key={d.titre}
                  className="group -mx-3 rounded-xl px-3 py-8 text-center transition-colors hover:bg-surface/60"
                >
                  <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-2.5 font-display text-2xl font-medium tracking-tight transition-colors group-hover:text-accent">
                    {d.titre}
                  </h3>
                  <p className="mx-auto mt-2.5 max-w-md leading-relaxed text-ink-soft">{d.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ---------- II · LE CABINET ---------- */}
        <section id="cabinet" className="border-t border-line bg-surface/40">
          <Reveal className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
            <SectionHead index="II" title="Le cabinet" />
            <p className="mx-auto mt-12 max-w-2xl font-display text-[1.7rem] font-medium italic leading-snug tracking-tight text-ink text-balance sm:text-[2rem]">
              «&nbsp;Accompagner chaque client avec écoute, rigueur et disponibilité, à chaque étape de son
              dossier.&nbsp;»
            </p>
            <p className="mx-auto mt-7 max-w-xl leading-relaxed text-ink-soft">
              Maître NGANGA, Docteur en droit, a prêté serment le 19&nbsp;avril 2000. Il intervient devant
              toutes les juridictions de France.
            </p>
          </Reveal>
        </section>

        {/* ---------- III · PRENDRE RENDEZ-VOUS ---------- */}
        <section className="border-t border-line">
          <Reveal className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
            <SectionHead index="III" title="Prendre rendez-vous" />
            <div className="mx-auto mt-12 max-w-xl divide-y divide-line border-y border-line">
              {STEPS.map((s, i) => (
                <div key={s.t} className="flex items-baseline gap-5 py-6">
                  <span className="font-mono text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-display text-lg font-medium tracking-tight">{s.t}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-sm text-ink-soft">
              Réponse rapide du cabinet · consultation réglée sur place.
            </p>
          </Reveal>
        </section>

        {/* ---------- COLOPHON + CTA ---------- */}
        <section id="infos" className="border-t border-line">
          <Reveal className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
            <div className="mx-auto mb-9 h-px w-12 bg-accent" />
            <h2 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
              Un rendez-vous à fixer ?
            </h2>
            <p className="mx-auto mt-5 max-w-md leading-relaxed text-ink-soft">
              Réservez en ligne en quelques minutes, ou appelez directement le cabinet.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <CtaPrimary />
              <PhoneBtn />
            </div>

            <div className="mx-auto mt-16 grid max-w-2xl gap-8 border-t border-line pt-12 text-sm sm:grid-cols-3">
              <div>
                <MapPin className="mx-auto h-5 w-5 text-accent" />
                <p className="mt-3 leading-relaxed text-ink">
                  {CABINET.adresse}
                  <br />
                  {CABINET.codePostal} {CABINET.ville}
                </p>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-ink-soft underline-offset-4 hover:text-accent hover:underline">
                  Voir l&apos;itinéraire
                </a>
              </div>
              <div>
                <Clock className="mx-auto h-5 w-5 text-accent" />
                <div className="mt-3 space-y-0.5 text-ink">
                  {HORAIRES_AFFICHAGE.map((h) => (
                    <p key={h.label}>{h.plage}</p>
                  ))}
                  <p className="text-ink-soft">du lundi au vendredi</p>
                </div>
              </div>
              <div>
                <Phone className="mx-auto h-5 w-5 text-accent" />
                <a href={`tel:${CABINET.telephoneE164}`} className="mt-3 block font-mono text-ink hover:text-accent">
                  {CABINET.telephone}
                </a>
                <p className="mt-1 text-ink-soft">Consultation {PRIX_CONSULTATION} € TTC</p>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

function CtaPrimary() {
  return (
    <Link
      href="/prendre-rdv"
      className="group inline-flex items-center gap-2 rounded-full bg-ink py-2 pl-6 pr-2 text-[15px] font-medium text-paper shadow-[0_12px_34px_-14px_rgba(27,42,74,0.6)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#243556] active:scale-[0.98]"
    >
      Prendre rendez-vous
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}

function PhoneBtn() {
  return (
    <a
      href={`tel:${CABINET.telephoneE164}`}
      className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-6 py-3.5 text-[15px] text-ink transition-colors hover:border-ink/40"
    >
      <Phone className="h-4 w-4" />
      <span className="font-mono">{CABINET.telephone}</span>
    </a>
  );
}

function SectionHead({ index, title }: { index: string; title: string }) {
  return (
    <div className="text-center">
      <span className="font-mono text-xs tracking-[0.25em] text-accent">{index}</span>
      <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      <div className="mx-auto mt-5 h-px w-10 bg-line" />
    </div>
  );
}
