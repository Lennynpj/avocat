import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { ArrowRight } from "@/components/Icons";
import { getAllArticles } from "@/lib/blog";
import { formatDateLong } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Journal — conseils juridiques",
  description:
    "Articles et conseils en droit pénal, droit des étrangers, droit de la famille et droit du travail, par Maître Jean Vivien NGANGA, avocat à Bobigny.",
  alternates: { canonical: "/blog" },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function BlogPage() {
  const articles = getAllArticles();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Journal — Cabinet NGANGA",
    url: `${siteUrl}/blog`,
    blogPost: articles.map((a) => ({
      "@type": "BlogPosting",
      headline: a.title,
      datePublished: a.date,
      url: `${siteUrl}/blog/${a.slug}`,
      about: a.category,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-xs uppercase tracking-[0.24em] text-accent">Journal</p>
        <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Comprendre vos droits, simplement
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
          Des repères clairs en droit pénal, droit des étrangers, droit de la famille et droit du travail — pour savoir
          quoi faire, et quand agir.
        </p>

        <div className="mt-14 divide-y divide-line border-y border-line">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/blog/${a.slug}`}
              className="group block py-8 transition-colors hover:bg-surface/50 sm:px-2"
            >
              <div className="flex items-center gap-3 text-xs">
                <span className="rounded-full bg-accent/8 px-2.5 py-1 font-medium uppercase tracking-wider text-accent">
                  {a.category}
                </span>
                <span className="font-mono text-ink-soft">{a.readingMinutes} min</span>
              </div>
              <h2 className="mt-4 font-display text-2xl font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-accent sm:text-[1.7rem]">
                {a.title}
              </h2>
              <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">{a.description}</p>
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-accent">
                Lire l&apos;article
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
