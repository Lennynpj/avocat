"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Booking, BookingStatus } from "@/lib/types";
import { formatDateLong, slotStart } from "@/lib/dates";
import { Cash } from "@/components/Icons";
import AdminTabs from "./AdminTabs";

type Filtre = "tous" | "valider" | "cabinet" | "paye" | "annules";

const STATUT_META: Record<BookingStatus, { label: string; dot: string; soft: string }> = {
  a_valider: { label: "À valider", dot: "bg-orange-500", soft: "text-orange-700" },
  paye: { label: "Réglé", dot: "bg-emerald-500", soft: "text-emerald-700" },
  a_payer_especes: { label: "À régler au cabinet", dot: "bg-amber-500", soft: "text-amber-700" },
  en_attente: { label: "En attente", dot: "bg-zinc-400", soft: "text-zinc-600" },
  rembourse: { label: "Remboursé", dot: "bg-rose-400", soft: "text-rose-600" },
  annule: { label: "Annulé", dot: "bg-zinc-300", soft: "text-zinc-500" },
  confirme: { label: "Suivi · sans frais", dot: "bg-sky-500", soft: "text-sky-700" },
};

function euro(n: number) {
  return `${n.toLocaleString("fr-FR")} €`;
}

export default function AdminPaiements({ bookings }: { bookings: Booking[] }) {
  const router = useRouter();
  const [filtre, setFiltre] = useState<Filtre>("tous");
  const [busyId, setBusyId] = useState<string | null>(null);

  // Rendez-vous avec un enjeu financier (consultations, à régler au cabinet).
  const paiements = useMemo(
    () =>
      bookings
        .filter((b) => b.paiement === "especes" || b.paiement === "cb")
        .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")),
    [bookings],
  );

  const stats = useMemo(() => {
    let encaisse = 0,
      aEncaisser = 0,
      nbValider = 0,
      nbAnnule = 0;
    for (const b of paiements) {
      if (b.statut === "paye") encaisse += b.montant;
      else if (b.statut === "a_payer_especes") aEncaisser += b.montant;
      else if (b.statut === "a_valider") nbValider += 1;
      else if (b.statut === "annule" || b.statut === "rembourse") nbAnnule += 1;
    }
    return { encaisse, aEncaisser, nbValider, nbAnnule };
  }, [paiements]);

  const liste = useMemo(() => {
    switch (filtre) {
      case "valider":
        return paiements.filter((b) => b.statut === "a_valider");
      case "cabinet":
        return paiements.filter((b) => b.statut === "a_payer_especes");
      case "paye":
        return paiements.filter((b) => b.statut === "paye");
      case "annules":
        return paiements.filter((b) => b.statut === "annule" || b.statut === "rembourse");
      default:
        return paiements;
    }
  }, [paiements, filtre]);

  async function act(id: string, action: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d.error || "Une erreur est survenue.");
      } else {
        router.refresh();
      }
    } catch {
      alert("Connexion impossible.");
    } finally {
      setBusyId(null);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  const FILTRES: { key: Filtre; label: string }[] = [
    { key: "tous", label: "Tous" },
    { key: "valider", label: "À valider" },
    { key: "cabinet", label: "À encaisser" },
    { key: "paye", label: "Réglés" },
    { key: "annules", label: "Annulés" },
  ];

  return (
    <div className="mx-auto max-w-2xl pb-28">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-[#f2f2f7]/85 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-4">
          <span className="text-lg font-semibold tracking-tight">Paiements</span>
          <button
            onClick={logout}
            className="rounded-full bg-white px-3.5 py-1.5 text-sm text-ink shadow-sm active:scale-95"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 px-4 pt-5">
        <StatCard label="Encaissé au cabinet" value={euro(stats.encaisse)} accent />
        <StatCard label="À encaisser au cabinet" value={euro(stats.aEncaisser)} />
        <StatCard label="Demandes à valider" value={String(stats.nbValider)} />
        <StatCard label="Annulés" value={String(stats.nbAnnule)} />
      </div>

      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto px-4">
        {FILTRES.map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltre(f.key)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filtre === f.key ? "bg-ink text-white" : "bg-white text-ink-soft shadow-sm active:scale-95"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2.5 px-4">
        {liste.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-black/10 bg-white/50 px-6 py-12 text-center text-sm text-ink-soft">
            Aucun rendez-vous dans cette catégorie.
          </p>
        ) : (
          liste.map((b) => {
            const meta = STATUT_META[b.statut];
            const busy = busyId === b.id;
            return (
              <div key={b.id} className="rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{b.client.nom}</p>
                    <p className="mt-0.5 text-sm text-ink-soft">
                      {formatDateLong(b.date)} · {slotStart(b.hour)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-base font-semibold">{euro(b.montant)}</p>
                    <p className={`mt-0.5 flex items-center justify-end gap-1.5 text-xs ${meta.soft}`}>
                      <span className={`h-2 w-2 rounded-full ${meta.dot}`} /> {meta.label}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-ink-soft">
                  <span className="inline-flex items-center gap-1">
                    <Cash className="h-3.5 w-3.5" /> Au cabinet
                  </span>
                  <span>·</span>
                  <span>{b.source === "telephone" ? "Pris par téléphone" : "Réservé en ligne"}</span>
                </div>

                {b.statut === "a_valider" && (
                  <div className="mt-3 flex gap-2 border-t border-black/5 pt-3">
                    <button
                      onClick={() => act(b.id, "validate")}
                      disabled={busy}
                      className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                    >
                      {busy ? "…" : "Confirmer"}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Refuser la demande de ${b.client.nom} ?`)) act(b.id, "decline");
                      }}
                      disabled={busy}
                      className="flex-1 rounded-xl bg-danger py-2.5 text-sm font-medium text-white disabled:opacity-50"
                    >
                      Refuser
                    </button>
                  </div>
                )}
                {b.statut === "a_payer_especes" && (
                  <div className="mt-3 flex gap-2 border-t border-black/5 pt-3">
                    <button
                      onClick={() => act(b.id, "mark-paid")}
                      disabled={busy}
                      className="flex-1 rounded-xl bg-ink py-2.5 text-sm font-medium text-white disabled:opacity-50"
                    >
                      {busy ? "…" : "Marquer réglé"}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Annuler le rendez-vous de ${b.client.nom} ?`)) act(b.id, "cancel");
                      }}
                      disabled={busy}
                      className="rounded-xl bg-[#f2f2f7] px-4 py-2.5 text-sm font-medium text-ink-soft disabled:opacity-50"
                    >
                      Annuler
                    </button>
                  </div>
                )}
                {b.statut === "paye" && (
                  <div className="mt-3 flex border-t border-black/5 pt-3">
                    <button
                      onClick={() => {
                        if (confirm(`Annuler le rendez-vous de ${b.client.nom} ?`)) act(b.id, "cancel");
                      }}
                      disabled={busy}
                      className="rounded-xl bg-[#f2f2f7] px-4 py-2.5 text-sm font-medium text-ink-soft disabled:opacity-50"
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <AdminTabs active="paiements" />
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${accent ? "bg-ink text-paper" : "bg-white"}`}
    >
      <p className={`text-xs ${accent ? "text-paper/70" : "text-ink-soft"}`}>{label}</p>
      <p className="mt-1 font-mono text-xl font-semibold">{value}</p>
    </div>
  );
}
