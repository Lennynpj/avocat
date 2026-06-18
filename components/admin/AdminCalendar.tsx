"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminSlot, Booking, SlotState } from "@/lib/types";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Ban,
  Phone,
  X,
  Check,
  Cash,
  CreditCard,
  FileText,
} from "@/components/Icons";
import AdminTabs from "./AdminTabs";

const WEEKDAYS_S = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"];
const WEEKDAYS_L = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const MONTHS_L = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

function addDays(iso: string, n: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}
function parts(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return { wd: dt.getUTCDay(), d, m, y };
}
function longDate(iso: string) {
  const { wd, d, m, y } = parts(iso);
  return `${WEEKDAYS_L[wd]} ${d} ${MONTHS_L[m - 1]} ${y}`;
}
const slotLabel = (h: number) => `${h}h – ${h + 1}h`;

const META: Record<SlotState, { label: string; dot: string; soft: string }> = {
  libre: { label: "Libre", dot: "bg-[#c7c7cc]", soft: "text-ink-soft" },
  paye: { label: "Payé", dot: "bg-emerald-500", soft: "text-emerald-700" },
  especes: { label: "Espèces", dot: "bg-amber-500", soft: "text-amber-700" },
  suivi: { label: "Suivi", dot: "bg-sky-500", soft: "text-sky-700" },
  en_attente: { label: "En attente", dot: "bg-zinc-400", soft: "text-zinc-600" },
  bloque: { label: "Bloqué", dot: "bg-zinc-300", soft: "text-zinc-500" },
};

function statusLabel(b: Booking): string {
  switch (b.statut) {
    case "paye": return `Payé · ${b.montant} €`;
    case "a_payer_especes": return "À payer en espèces";
    case "confirme": return "Suivi de dossier";
    case "en_attente": return "Paiement en attente";
    default: return b.statut;
  }
}

type Sheet =
  | { t: "free"; hour: number }
  | { t: "add"; hour: number }
  | { t: "booking"; slot: AdminSlot }
  | { t: "blocked"; slot: AdminSlot }
  | { t: "day" }
  | null;

export default function AdminCalendar({
  date,
  today,
  slots,
  dayBlocked,
}: {
  date: string;
  today: string;
  slots: AdminSlot[];
  dayBlocked: boolean;
}) {
  const router = useRouter();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [busy, setBusy] = useState(false);

  // formulaire RDV téléphone
  const [fNom, setFNom] = useState("");
  const [fTel, setFTel] = useState("");
  const [fEmail, setFEmail] = useState("");
  const [fType, setFType] = useState<"consultation" | "suivi_dossier">("consultation");
  const [fPaye, setFPaye] = useState(false);
  const [fDossier, setFDossier] = useState("");

  const strip = Array.from({ length: 21 }, (_, i) => addDays(today, i));
  const rdvCount = slots.filter((s) => s.booking && ["paye", "especes", "suivi", "en_attente"].includes(s.state)).length;

  function go(d: string) {
    setSheet(null);
    router.push(`/admin/calendrier?date=${d}`);
  }
  function closeSheet() {
    setSheet(null);
    setFNom(""); setFTel(""); setFEmail(""); setFType("consultation"); setFPaye(false); setFDossier("");
  }

  async function act(url: string, body: object, method = "POST") {
    setBusy(true);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d.error || "Une erreur est survenue.");
      } else {
        closeSheet();
        router.refresh();
      }
    } catch {
      alert("Connexion impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl pb-28">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-black/5 bg-[#f2f2f7]/85 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-4">
          <span className="text-lg font-semibold tracking-tight">Agenda</span>
          <button onClick={logout} className="rounded-full bg-white px-3.5 py-1.5 text-sm text-ink shadow-sm active:scale-95">
            Déconnexion
          </button>
        </div>

        {/* Nav date */}
        <div className="flex items-center justify-between gap-2 px-4 pb-3">
          <button onClick={() => go(addDays(date, -1))} className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm active:scale-95">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 text-center">
            <p className="text-sm font-semibold capitalize">{longDate(date)}</p>
            <button onClick={() => go(today)} className="text-xs text-accent">
              {date === today ? "Aujourd'hui" : "Revenir à aujourd'hui"}
            </button>
          </div>
          <button onClick={() => go(addDays(date, 1))} className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm active:scale-95">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Bandeau jours */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
          {strip.map((d) => {
            const p = parts(d);
            const on = d === date;
            return (
              <button
                key={d}
                onClick={() => go(d)}
                className={`flex min-w-[46px] flex-col items-center rounded-2xl px-2 py-2 transition-colors ${
                  on ? "bg-ink text-white" : "bg-white text-ink shadow-sm active:scale-95"
                }`}
              >
                <span className={`text-[11px] ${on ? "text-white/70" : "text-ink-soft"}`}>{WEEKDAYS_S[p.wd]}</span>
                <span className="font-mono text-base font-semibold">{p.d}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Résumé + action journée */}
      <div className="flex items-center justify-between px-5 py-4">
        <p className="text-sm text-ink-soft">
          {dayBlocked ? (
            <span className="font-medium text-zinc-600">Journée bloquée</span>
          ) : (
            <>
              <span className="font-semibold text-ink">{rdvCount}</span> rendez-vous
            </>
          )}
        </p>
        {dayBlocked ? (
          <button
            onClick={() => act("/api/admin/slots", { action: "unblock-day", date })}
            disabled={busy}
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm active:scale-95"
          >
            Débloquer la journée
          </button>
        ) : (
          <button
            onClick={() => setSheet({ t: "day" })}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-accent shadow-sm active:scale-95"
          >
            <Ban className="h-4 w-4" /> Bloquer la journée
          </button>
        )}
      </div>

      {/* Liste des créneaux */}
      <div className="space-y-2.5 px-4">
        {slots.map((s) => {
          const meta = META[s.state];
          const clickable = s.state !== "bloque" || s.blocage;
          return (
            <button
              key={s.hour}
              onClick={() => {
                if (s.state === "libre") setSheet({ t: "free", hour: s.hour });
                else if (s.state === "bloque") setSheet({ t: "blocked", slot: s });
                else setSheet({ t: "booking", slot: s });
              }}
              disabled={!clickable}
              className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-transform active:scale-[0.99]"
            >
              <div className="flex w-14 shrink-0 flex-col items-center">
                <span className="font-mono text-lg font-semibold leading-none">{s.hour}h</span>
                <span className="mt-1 text-[10px] text-ink-soft">{s.hour + 1}h</span>
              </div>
              <div className="h-10 w-px bg-black/5" />
              <div className="min-w-0 flex-1">
                {s.state === "libre" && <p className="text-ink-soft">Créneau libre</p>}
                {s.state === "bloque" && (
                  <p className="truncate font-medium text-zinc-600">{s.blocage?.motif || "Bloqué"}</p>
                )}
                {s.booking && (
                  <>
                    <p className="truncate font-semibold">{s.booking.client.nom}</p>
                    <p className={`truncate text-sm ${meta.soft}`}>{statusLabel(s.booking)}</p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {s.state === "libre" ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f2f2f7] text-ink-soft">
                    <Plus className="h-4 w-4" />
                  </span>
                ) : (
                  <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ---------- BOTTOM SHEET ---------- */}
      {sheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={closeSheet}>
          <div className="absolute inset-0 animate-fadeIn bg-black/30" />
          <div
            className="relative z-10 w-full max-w-2xl animate-sheetUp rounded-t-3xl bg-[#f2f2f7] p-5 pb-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-black/15" />

            {/* Créneau libre */}
            {sheet.t === "free" && (
              <div>
                <SheetTitle>Créneau {slotLabel(sheet.hour)}</SheetTitle>
                <div className="mt-4 space-y-2.5">
                  <BigButton onClick={() => setSheet({ t: "add", hour: sheet.hour })} icon={<Phone className="h-5 w-5" />}>
                    Ajouter un rendez-vous (téléphone)
                  </BigButton>
                  <BigButton
                    onClick={() => act("/api/admin/slots", { action: "block", date, hour: sheet.hour })}
                    disabled={busy}
                    icon={<Ban className="h-5 w-5" />}
                    tone="muted"
                  >
                    Bloquer ce créneau
                  </BigButton>
                </div>
              </div>
            )}

            {/* Ajout RDV téléphone */}
            {sheet.t === "add" && (
              <div>
                <SheetTitle>Rendez-vous · {slotLabel(sheet.hour)}</SheetTitle>
                <div className="mt-4 space-y-3">
                  <Segmented
                    value={fType}
                    onChange={(v) => setFType(v as "consultation" | "suivi_dossier")}
                    options={[
                      { value: "consultation", label: "Consultation" },
                      { value: "suivi_dossier", label: "Suivi" },
                    ]}
                  />
                  <SheetInput value={fNom} onChange={setFNom} placeholder="Nom du client *" />
                  <SheetInput value={fTel} onChange={setFTel} placeholder="Téléphone" inputMode="tel" />
                  <SheetInput value={fEmail} onChange={setFEmail} placeholder="Email (facultatif)" inputMode="email" />
                  {fType === "suivi_dossier" && (
                    <SheetInput value={fDossier} onChange={setFDossier} placeholder="Nom du dossier" />
                  )}
                  {fType === "consultation" && (
                    <label className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
                      <span className="text-sm">Déjà réglé (espèces)</span>
                      <input type="checkbox" checked={fPaye} onChange={(e) => setFPaye(e.target.checked)} className="h-5 w-5 accent-[#1B2A4A]" />
                    </label>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setSheet({ t: "free", hour: sheet.hour })} className="flex-1 rounded-xl bg-white py-3 text-sm font-medium shadow-sm">
                      Retour
                    </button>
                    <button
                      onClick={() =>
                        act("/api/admin/manual-booking", {
                          date,
                          hour: sheet.hour,
                          type: fType,
                          paiement: fType === "consultation" && fPaye ? "paye" : "especes",
                          client: { nom: fNom, telephone: fTel, email: fEmail },
                          dossier: fDossier,
                        })
                      }
                      disabled={busy || fNom.trim().length < 2}
                      className="flex-[1.4] rounded-xl bg-ink py-3 text-sm font-medium text-white disabled:opacity-50"
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Détail RDV */}
            {sheet.t === "booking" && sheet.slot.booking && (
              <BookingSheet booking={sheet.slot.booking} hour={sheet.slot.hour} busy={busy} act={act} />
            )}

            {/* Créneau bloqué */}
            {sheet.t === "blocked" && (
              <div>
                <SheetTitle>{sheet.slot.blocage?.motif || "Créneau bloqué"}</SheetTitle>
                <p className="mt-1 text-sm text-ink-soft">{slotLabel(sheet.slot.hour)}</p>
                <div className="mt-4">
                  {sheet.slot.blocage?.hour === null ? (
                    <BigButton onClick={() => act("/api/admin/slots", { action: "unblock-day", date })} disabled={busy} icon={<Check className="h-5 w-5" />}>
                      Débloquer la journée
                    </BigButton>
                  ) : (
                    <BigButton onClick={() => act("/api/admin/slots", { action: "unblock", date, hour: sheet.slot.hour })} disabled={busy} icon={<Check className="h-5 w-5" />}>
                      Débloquer ce créneau
                    </BigButton>
                  )}
                </div>
              </div>
            )}

            {/* Bloquer la journée */}
            {sheet.t === "day" && (
              <div>
                <SheetTitle>Bloquer toute la journée</SheetTitle>
                <p className="mt-1 text-sm text-ink-soft">{longDate(date)}</p>
                <div className="mt-4 space-y-2.5">
                  {["Audience — TGI de Bobigny", "Congés", "Indisponible"].map((motif) => (
                    <BigButton key={motif} onClick={() => act("/api/admin/slots", { action: "block-day", date, motif })} disabled={busy} icon={<Ban className="h-5 w-5" />} tone="muted">
                      {motif}
                    </BigButton>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <AdminTabs active="agenda" />
    </div>
  );
}

/* ---------- sous-composants ---------- */

function BookingSheet({
  booking,
  hour,
  busy,
  act,
}: {
  booking: Booking;
  hour: number;
  busy: boolean;
  act: (url: string, body: object, method?: string) => Promise<void>;
}) {
  const url = `/api/admin/bookings/${booking.id}`;
  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <SheetTitle>{booking.client.nom}</SheetTitle>
          <p className="mt-1 text-sm text-ink-soft">
            {slotLabel(hour)} · {booking.type === "consultation" ? "Consultation" : "Suivi de dossier"}
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium shadow-sm">{statusLabel(booking)}</span>
      </div>

      <div className="mt-4 space-y-2 rounded-2xl bg-white p-4 text-sm">
        {booking.client.telephone && (
          <a href={`tel:${booking.client.telephone}`} className="flex items-center gap-2 text-accent">
            <Phone className="h-4 w-4" /> {booking.client.telephone}
          </a>
        )}
        {booking.client.email && <p className="break-all text-ink-soft">{booking.client.email}</p>}
        {booking.dossier && (
          <p className="flex items-center gap-2 text-ink-soft">
            <FileText className="h-4 w-4" /> {booking.dossier}
          </p>
        )}
        <p className="flex items-center gap-2 text-ink-soft">
          {booking.paiement === "cb" ? <CreditCard className="h-4 w-4" /> : booking.paiement === "especes" ? <Cash className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
          {booking.source === "telephone" ? "Pris par téléphone" : "Réservé en ligne"}
        </p>
      </div>

      <div className="mt-4 space-y-2.5">
        {booking.statut === "a_payer_especes" && (
          <BigButton onClick={() => act(url, { action: "mark-paid" }, "PATCH")} disabled={busy} icon={<Check className="h-5 w-5" />}>
            Marquer comme payé
          </BigButton>
        )}
        {booking.statut === "paye" && (
          <BigButton onClick={() => act(url, { action: "refund" }, "PATCH")} disabled={busy} icon={<Cash className="h-5 w-5" />} tone="danger">
            Rembourser {booking.montant} €
          </BigButton>
        )}
        <BigButton onClick={() => act(url, { action: "cancel" }, "PATCH")} disabled={busy} icon={<X className="h-5 w-5" />} tone="muted">
          Annuler le rendez-vous
        </BigButton>
      </div>
    </div>
  );
}

function SheetTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold tracking-tight">{children}</h2>;
}

function BigButton({
  children,
  onClick,
  disabled,
  icon,
  tone = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  tone?: "primary" | "muted" | "danger";
}) {
  const cls =
    tone === "primary"
      ? "bg-ink text-white"
      : tone === "danger"
        ? "bg-danger text-white"
        : "bg-white text-ink";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 text-[15px] font-medium shadow-sm transition-transform active:scale-[0.98] disabled:opacity-50 ${cls}`}
    >
      {icon}
      {children}
    </button>
  );
}

function SheetInput({
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  inputMode?: "tel" | "email" | "text";
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      inputMode={inputMode}
      className="w-full rounded-xl bg-white px-4 py-3 text-base outline-none ring-accent focus:ring-2"
    />
  );
}

function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex rounded-xl bg-black/[0.06] p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            value === o.value ? "bg-white shadow-sm" : "text-ink-soft"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
