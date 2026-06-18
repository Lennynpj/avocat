"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CABINET } from "@/lib/config";
import { Phone, ArrowRight, Scale } from "@/components/Icons";

const NAV = [
  { label: "Domaines", href: "/#domaines" },
  { label: "Le cabinet", href: "/#cabinet" },
  { label: "Journal", href: "/blog" },
  { label: "Informations", href: "/#infos" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const sentinel = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    // Détection du scroll SANS écouteur 'scroll' : un capteur de 0px en haut de page.
    const io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinel} aria-hidden className="h-0" />
      <header
        className={`sticky top-0 z-40 transition-[padding] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          scrolled ? "px-3 sm:px-4" : "px-0"
        }`}
      >
        {/* La barre se transforme en pilule flottante au scroll */}
        <div
          className={`mx-auto flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            scrolled
              ? "mt-3 max-w-4xl gap-5 rounded-full border border-ink/[0.07] bg-paper/70 px-5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_14px_40px_-18px_rgba(22,19,15,0.5)] backdrop-blur-xl"
              : "mt-0 max-w-6xl gap-6 rounded-none border border-transparent bg-transparent px-5 py-4 sm:px-8"
          }`}
        >
          {/* Wordmark — l'emblème glisse à l'apparition quand on scrolle */}
          <Link href="/" className="flex items-center gap-2.5">
            <span
              className={`flex items-center justify-center overflow-hidden text-accent transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                scrolled ? "w-5 opacity-100" : "w-0 -translate-x-2 opacity-0"
              }`}
            >
              <Scale className="h-5 w-5 shrink-0" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-xl font-semibold tracking-tight text-ink">NGANGA</span>
              <span
                className={`grid overflow-hidden text-[10px] uppercase tracking-[0.2em] text-ink-soft transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  scrolled ? "mt-0 grid-rows-[0fr] opacity-0" : "mt-0.5 grid-rows-[1fr] opacity-100"
                }`}
              >
                <span className="overflow-hidden">Avocat · Barreau de Bobigny</span>
              </span>
            </span>
          </Link>

          {/* Navigation — souligné animé au survol */}
          <nav className="hidden items-center gap-6 text-sm text-ink-soft md:flex">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="relative whitespace-nowrap transition-colors duration-300 hover:text-ink after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.32,0.72,0,1)] hover:after:scale-x-100"
              >
                {n.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <a
              href={`tel:${CABINET.telephoneE164}`}
              className={`items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-ink transition-colors hover:border-ink/40 ${
                scrolled ? "hidden" : "hidden lg:flex"
              }`}
              aria-label={`Appeler le cabinet au ${CABINET.telephone}`}
            >
              <Phone className="h-4 w-4" />
              <span className="font-mono tracking-tight">{CABINET.telephone}</span>
            </a>
            <Link
              href="/prendre-rdv"
              className="group flex items-center gap-2 whitespace-nowrap rounded-full bg-ink py-1.5 pl-5 pr-1.5 text-sm font-medium text-paper transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#243556] active:scale-[0.98]"
            >
              Rendez-vous
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
