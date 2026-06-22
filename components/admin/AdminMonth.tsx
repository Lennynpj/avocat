"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "@/components/Icons";
import AdminTabs from "./AdminTabs";

const WD = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"];
const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

const pad = (n: number) => String(n).padStart(2, "0");

function shiftMonth(monthISO: string, delta: number) {
  const [y, m] = monthISO.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}`;
}

// 6 semaines (42 cases), lundi en première colonne.
function buildCells(monthISO: string, today: string) {
  const [y, m] = monthISO.split("-").map(Number);
  const firstDow = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  const start = Date.UTC(y, m - 1, 1) - firstDow * 86400000;
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const dt = new Date(start + i * 86400000);
    const iso = `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
    const dow = (dt.getUTCDay() + 6) % 7;
    cells.push({
      iso,
      day: dt.getUTCDate(),
      inMonth: dt.getUTCMonth() === m - 1,
      weekend: dow >= 5,
      isToday: iso === today,
      past: iso < today,
    });
  }
  return cells;
}

export default function AdminMonth({
  month,
  today,
  marks,
}: {
  month: string;
  today: string;
  marks: Record<string, { rdv: number; audience: boolean }>;
}) {
  const router = useRouter();
  const [y, m] = month.split("-").map(Number);
  const cells = buildCells(month, today);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }
  const go = (mm: string) => router.push(`/admin/mois?m=${mm}`);

  return (
    <div className="mx-auto max-w-2xl pb-28">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-[#f2f2f7]/85 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-4">
          <span className="text-lg font-semibold tracking-tight">Calendrier</span>
          <button onClick={logout} className="rounded-full bg-white px-3.5 py-1.5 text-sm text-ink shadow-sm active:scale-95">
            Déconnexion
          </button>
        </div>
      </header>

      {/* Navigation mois */}
      <div className="flex items-center justify-center gap-4 px-4 pt-5">
        <button
          onClick={() => go(shiftMonth(month, -1))}
          aria-label="Mois précédent"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="min-w-[150px] text-center font-display text-xl font-semibold capitalize tracking-tight">
          {MONTHS[m - 1]} {y}
        </span>
        <button
          onClick={() => go(shiftMonth(month, 1))}
          aria-label="Mois suivant"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm active:scale-95"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="pb-3 pt-1 text-center">
        <button onClick={() => go(today.slice(0, 7))} className="text-xs text-accent">
          Aujourd&apos;hui
        </button>
      </div>

      {/* Calendrier — double cadre */}
      <div className="px-4">
        <div className="animate-fadeIn rounded-[1.7rem] border border-black/5 bg-white/40 p-1.5">
          <div className="rounded-[1.35rem] bg-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
            <div className="grid grid-cols-7 gap-1.5 pb-1.5">
              {WD.map((d) => (
                <span key={d} className="text-center text-[11px] tracking-wide text-ink-soft">
                  {d}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {cells.map((c) => {
                const mk = marks[c.iso];
                const audience = mk?.audience;
                return (
                  <button
                    key={c.iso}
                    onClick={() => router.push(`/admin/calendrier?date=${c.iso}`)}
                    className={`relative flex aspect-square flex-col items-center justify-center rounded-xl border text-ink transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.95] ${
                      audience
                        ? "border-danger/30 bg-danger/[0.06]"
                        : c.weekend
                          ? "border-line bg-[#f2f2f7]"
                          : "border-line bg-white hover:bg-surface"
                    } ${!c.inMonth ? "opacity-30" : c.past ? "opacity-50" : ""}`}
                  >
                    {c.isToday ? (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink font-mono text-sm text-white">
                        {c.day}
                      </span>
                    ) : (
                      <span className="font-mono text-[15px]">{c.day}</span>
                    )}
                    {mk && mk.rdv > 0 ? (
                      <span className="mt-1 inline-flex items-center gap-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                        {mk.rdv > 1 && <span className="font-mono text-[10px] text-accent">{mk.rdv}</span>}
                      </span>
                    ) : (
                      <span className="mt-1 block h-2.5" />
                    )}
                    {audience && <span className="absolute inset-x-1.5 bottom-1 h-[3px] rounded-full bg-danger" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Légende */}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-xs text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> rendez-vous
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-[3px] w-4 rounded-full bg-danger" /> audience / bloqué
          </span>
        </div>
      </div>

      <AdminTabs active="mois" />
    </div>
  );
}
