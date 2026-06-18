import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ArticleBody from "@/components/blog/ArticleBody";
import { ArrowRight, ArrowLeft, Scale, Phone } from "@/components/Icons";
import { getArticle, getAllArticles, getRelated } from "@/lib/blog";
import { formatDateLong } from "@/lib/dates";
import { CABINET } from "@/lib/config";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const a = getArticle(params.slug);
  if (!a) return {};
  return {
    title: a.title,
    description: a.description,
    keywords: a.keywords,
    alternates: { canonical: `/blog/${a.slug}` },
    robots: { index: false, follow: false },
    openGraph: {
      type: "article",
      title: a.title,
      description: a.description,
      publishedTime: a.date,
      modifiedTime: a.updated || a.date,
    },
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const a = getArticle(params.slug);
  if (!a) notFound();
  const related = getRelated(a.slug);
  const url = `${siteUrl}/blog/${a.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: a.title,
      description: a.description,
      datePublished: a.date,
      dateModified: a.updated || a.date,
      inLanguage: "fr-FR",
      articleSection: a.category,
      keywords: a.keywords.join(", "),
      mainEntityOfPage: url,
      author: {
        "@type": "Person",
        name: CABINET.avocat,
        jobTitle: "Avocat au Barreau de Bobigny",
      },
      publisher: {
        "@type": "LegalService",
        name: CABINET.nomCourt,
        telephone: CABINET.telephoneE164,
        address: {
          "@type": "PostalAddress",
          streetAddress: CABINET.adresse,
          addressLocality: CABINET.ville,
          postalCode: CABINET.codePostal,
          addressCountry: "FR",
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: a.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Journal", item: `${siteUrl}/blog` },
        { "@type": "ListItem", position: 3, name: a.title, item: url },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />

      <main className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-14">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-accent">
          <ArrowLeft className="h-4 w-4" /> Journal
        </Link>

        <div className="mt-6 flex items-center gap-3 text-xs">
          <span className="rounded-full bg-accent/8 px-2.5 py-1 font-medium uppercase tracking-wider text-accent">
            {a.category}
          </span>
          <span className="font-mono text-ink-soft">{a.readingMinutes} min de lecture</span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-[2.6rem]">
          {a.title}
        </h1>
        <p className="mt-4 text-sm text-ink-soft">
          Publié le {formatDateLong(a.date)}
          {a.updated ? ` · mis à jour le ${formatDateLong(a.updated)}` : ""}
        </p>

        {/* Réponse rapide — citable (GEO) */}
        <div className="mt-8 rounded-2xl border border-accent/20 bg-accent/[0.04] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">En bref</p>
          <p className="mt-2 text-[17px] leading-relaxed text-ink">{a.answer}</p>
        </div>

        <article className="mt-10">
          <ArticleBody blocks={a.blocks} />
        </article>

        {/* FAQ */}
        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Questions fréquentes</h2>
          <div className="mt-6 divide-y divide-line border-y border-line">
            {a.faq.map((f, i) => (
              <details key={i} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
                  {f.q}
                  <span className="text-accent transition-transform duration-300 group-open:rotate-45">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 leading-relaxed text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Auteur — E-E-A-T */}
        <section className="mt-14 flex items-start gap-4 rounded-2xl border border-line bg-surface p-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink text-white">
            <Scale className="h-6 w-6" />
          </span>
          <div>
            <p className="font-display text-lg font-semibold">{CABINET.avocat}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              {CABINET.titre}. Le cabinet accompagne les particuliers en droit pénal, droit des étrangers, droit de la
              famille et droit du travail à Clichy-sous-bois et en Seine-Saint-Denis.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-8 overflow-hidden rounded-[1.75rem] bg-ink p-7 text-paper">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Une question sur votre situation ?</h2>
          <p className="mt-2 max-w-md text-paper/70">
            Prenez rendez-vous pour une première consultation, ou appelez directement le cabinet.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/prendre-rdv"
              className="group inline-flex items-center gap-1.5 rounded-full bg-paper py-2 pl-5 pr-2 text-sm font-medium text-ink"
            >
              Prendre rendez-vous
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink/10 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <a href={`tel:${CABINET.telephoneE164}`} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-paper/90 hover:bg-white/5">
              <Phone className="h-4 w-4" /> {CABINET.telephone}
            </a>
          </div>
        </section>

        {/* Articles liés */}
        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xs uppercase tracking-[0.2em] text-ink-soft">À lire aussi</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="group rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-ink/30"
                >
                  <p className="text-[11px] uppercase tracking-wider text-accent">{r.category}</p>
                  <p className="mt-2 font-display text-lg font-medium leading-snug text-ink group-hover:text-accent">
                    {r.title}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
