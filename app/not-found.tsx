import Link from "next/link";
import { Scale, ArrowRight } from "@/components/Icons";

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <Scale className="h-10 w-10 text-accent" />
      <p className="mt-6 font-mono text-sm text-ink-soft">Erreur 404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Page introuvable</h1>
      <p className="mt-3 max-w-sm text-ink-soft">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#243556]"
      >
        Retour à l&apos;accueil <ArrowRight className="h-4 w-4" />
      </Link>
    </main>
  );
}
