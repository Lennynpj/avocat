import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Reveal from "@/components/Reveal";
import { ArrowRight, Phone, MapPin, Clock, Scale } from "@/components/Icons";
import { CABINET, PRIX_CONSULTATION, HORAIRES_AFFICHAGE } from "@/lib/config";
import { getAllArticles } from "@/lib/blog";

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
  areaServed: ["Clichy-sous-bois", "Bobigny", "Seine-Saint-Denis", "Île-de-France"],
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
  { t: "Régler la consultation", d: "Par carte bancaire ou en espèces. Le suivi de dossier est sans frais." },
  { t: "Recevoir la confirmation", d: "Par email et SMS, avec un rappel la veille du rendez-vous." },
];

export default function HomePage() {
  const latest = getAllArticles().slice(0, 3);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />

      <main>
        {/* ---------- HERO — papier à en-tête ---------- */}
        <section>
          <div className="mx-auto max-w-3xl px-5 pb-14 pt-16 text-center sm:px-8 sm:pt-24">
            <div className="reveal flex justify-center" style={{ ["--i" as string]: 0 }}>
              <Scale className="h-8 w-8 text-accent" />
            </div>
            <p className="reveal mt-6 text-[11px] uppercase tracking-[0.28em] text-accent" style={{ ["--i" as string]: 1 }}>
              Avocat au Barreau de Bobigny · depuis 2000
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
              Maître NGANGA, Docteur en droit, a prêté serment le 19&nbsp;avril 2000. Il intervient devant les
              juridictions de Seine-Saint-Denis et d&apos;Île-de-France.
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
              Carte bancaire ou espèces · suivi de dossier sans frais.
            </p>
          </Reveal>
        </section>

        {/* ---------- IV · JOURNAL ---------- */}
        <section className="border-t border-line bg-surface/40">
          <Reveal className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
            <SectionHead index="IV" title="Journal" />
            <div className="mx-auto mt-10 max-w-xl divide-y divide-line border-y border-line text-center">
              {latest.map((a) => (
                <Link key={a.slug} href={`/blog/${a.slug}`} className="group block py-6">
                  <span className="text-[11px] uppercase tracking-wider text-accent">{a.category}</span>
                  <h3 className="mt-1.5 font-display text-lg font-medium leading-snug text-ink transition-colors group-hover:text-accent">
                    {a.title}
                  </h3>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/blog" className="group inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                Tous les articles
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1" />
              </Link>
            </div>
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
      className="group inline-flex items-center gap-2 rounded-full bg-accent py-2 pl-6 pr-2 text-[15px] font-medium text-white shadow-[0_10px_30px_-12px_rgba(126,22,33,0.7)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-accent-strong active:scale-[0.98]"
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
