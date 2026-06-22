"use client";

import Link from "next/link";
import { Clock, Calendar, CreditCard } from "@/components/Icons";

// Barre de navigation flottante « liquid glass » — ancrée en bas, façon app iOS.
export default function AdminTabs({ active }: { active: "agenda" | "mois" | "paiements" }) {
  const items = [
    { href: "/admin/calendrier", key: "agenda", label: "Agenda", Icon: Clock },
    { href: "/admin/mois", key: "mois", label: "Mois", Icon: Calendar },
    { href: "/admin/paiements", key: "paiements", label: "Paiements", Icon: CreditCard },
  ] as const;

  const cls = (on: boolean) =>
    `flex flex-1 flex-col items-center gap-1 rounded-[20px] py-2 text-[11px] font-medium tracking-tight transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95 ${
      on
        ? "bg-white text-ink shadow-[0_3px_10px_-3px_rgba(27,42,74,0.28)]"
        : "text-ink-soft hover:text-ink"
    }`;

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(14px,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex w-full max-w-[340px] items-center gap-1.5 rounded-[26px] border border-white/50 bg-white/55 p-1.5 shadow-[0_12px_44px_-10px_rgba(27,42,74,0.42),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-2xl backdrop-saturate-150">
        {items.map(({ href, key, label, Icon }) => (
          <Link key={key} href={href} aria-current={active === key ? "page" : undefined} className={cls(active === key)}>
            <Icon className="h-[22px] w-[22px]" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
