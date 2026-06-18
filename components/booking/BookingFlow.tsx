"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Scale,
  ArrowRight,
  ArrowLeft,
  Check,
  CreditCard,
  Cash,
  FileText,
  Clock,
  Lock,
} from "@/components/Icons";

type RdvType = "consultation" | "suivi_dossier";
type Paiement = "cb" | "especes";
type Step = "type" | "creneau" | "coords" | "paiement" | "recap";

interface DayAvailability {
  date: string;
  hours: number[];
}

const PRIX = 120;

const WEEKDAYS = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

function fmtDay(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return { wd: WEEKDAYS[dt.getUTCDay()], dnum: d, month: MONTHS[m - 1] };
}
function fmtLong(date: string) {
  const { wd, dnum, month } = fmtDay(date);
  return `${wd} ${dnum} ${month}`;
}
const slotLabel = (h: number) => `${h}h – ${h + 1}h`;

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function isPhoneFR(v: string) {
  return /^(?:\+33|0)[1-9](?:[\s.-]?\d{2}){4}$/.test(v.trim());
}

export default function BookingFlow() {
  const [step, setStep] = useState<Step>("type");
  const [type, setType] = useState<RdvType | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [hour, setHour] = useState<number | null>(null);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [dossier, setDossier] = useState("");
  const [paiement, setPaiement] = useState<Paiement | null>(null);

  const [days, setDays] = useState<DayAvailability[] | null>(null);
  const [loadingAvail, setLoadingAvail] = useState(true);
  const [availError, setAvailError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [canceledNotice, setCanceledNotice] = useState(false);
  const [touched, setTouched] = useState(false);

  // Disponibilités + détection d'un retour Stripe annulé
  useEffect(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search);
      if (q.get("canceled") === "1") setCanceledNotice(true);
    }
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/availability");
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (alive) setDays(data.days ?? []);
      } catch {
        if (alive) setAvailError(true);
      } finally {
        if (alive) setLoadingAvail(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const order: Step[] = useMemo(
    () =>
      type === "suivi_dossier"
        ? ["type", "creneau", "coords", "recap"]
        : ["type", "creneau", "coords", "paiement", "recap"],
    [type],
  );
  const idx = order.indexOf(step);
  const progress = ((idx + 1) / order.length) * 100;

  const selectedDay = days?.find((d) => d.date === date) ?? null;

  // Validation par étape
  const canContinue = useMemo(() => {
    switch (step) {
      case "type":
        return type !== null;
      case "creneau":
        return date !== null && hour !== null;
      case "coords":
        return (
          nom.trim().length >= 2 &&
          isEmail(email) &&
          isPhoneFR(tel) &&
          (type !== "suivi_dossier" || dossier.trim().length >= 2)
        );
      case "paiement":
        return paiement !== null;
      default:
        return true;
    }
  }, [step, type, date, hour, nom, email, tel, dossier, paiement]);

  function goNext() {
    setTouched(false);
    if (idx < order.length - 1) setStep(order[idx + 1]);
  }
  function goBack() {
    setTouched(false);
    setSubmitError(null);
    if (idx > 0) setStep(order[idx - 1]);
  }

  async function submit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        type,
        date,
        hour,
        paiement: type === "suivi_dossier" ? "aucun" : paiement,
        client: { nom: nom.trim(), email: email.trim(), telephone: tel.trim() },
        dossier: type === "suivi_dossier" ? dossier.trim() : undefined,
      };
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Une erreur est survenue. Réessayez.");
        setSubmitting(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url; // redirection Stripe
        return;
      }
      if (data.redirect) {
        window.location.href = data.redirect;
        return;
      }
      setSubmitError("Réponse inattendue du serveur.");
      setSubmitting(false);
    } catch {
      setSubmitError("Connexion impossible. Vérifiez votre réseau.");
      setSubmitting(false);
    }
  }

  const montant = type === "suivi_dossier" ? 0 : PRIX;

  return (
    <div className="pb-28">
      {/* En-tête + progression */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-accent">
          <Scale className="h-5 w-5" />
          <span className="text-xs uppercase tracking-[0.18em]">Prise de rendez-vous</span>
        </div>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
          {step === "type" && "Quel type de rendez-vous ?"}
          {step === "creneau" && "Choisissez un créneau"}
          {step === "coords" && "Vos coordonnées"}
          {step === "paiement" && "Mode de paiement"}
          {step === "recap" && "Récapitulatif"}
        </h1>
        <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 font-mono text-xs text-ink-soft">
          Étape {idx + 1} / {order.length}
        </p>
      </div>

      {canceledNotice && step === "type" && (
        <div className="mb-6 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-soft">
          Le paiement a été annulé. Votre créneau n&apos;a pas été réservé, vous pouvez recommencer.
        </div>
      )}

      {/* ----- ÉTAPE TYPE ----- */}
      {step === "type" && (
        <div className="grid gap-3">
          <ChoiceCard
            active={type === "consultation"}
            onClick={() => setType("consultation")}
            icon={<Scale className="h-5 w-5" />}
            title="Première consultation"
            desc="Rendez-vous d'une heure pour exposer votre situation et définir une stratégie."
            tag={`${PRIX} € TTC`}
          />
          <ChoiceCard
            active={type === "suivi_dossier"}
            onClick={() => setType("suivi_dossier")}
            icon={<FileText className="h-5 w-5" />}
            title="Suivi de dossier"
            desc="Vous êtes déjà suivi par le cabinet et souhaitez faire le point sur votre dossier."
            tag="Sans frais"
          />
        </div>
      )}

      {/* ----- ÉTAPE CRÉNEAU ----- */}
      {step === "creneau" && (
        <div>
          {loadingAvail && <AvailabilitySkeleton />}
          {!loadingAvail && availError && (
            <EmptyState text="Impossible de charger les disponibilités. Réessayez dans un instant ou appelez le cabinet." />
          )}
          {!loadingAvail && !availError && days && days.length === 0 && (
            <EmptyState text="Aucune disponibilité sur les prochaines semaines. Contactez le cabinet au 01 43 32 05 84." />
          )}
          {!loadingAvail && !availError && days && days.length > 0 && (
            <>
              <p className="mb-3 text-sm text-ink-soft">Sélectionnez un jour</p>
              <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {days.map((d) => {
                  const { wd, dnum, month } = fmtDay(d.date);
                  const on = date === d.date;
                  return (
                    <button
                      key={d.date}
                      onClick={() => {
                        setDate(d.date);
                        setHour(null);
                      }}
                      className={`flex min-w-[68px] flex-col items-center rounded-2xl border px-3 py-3 transition-all active:scale-[0.97] ${
                        on
                          ? "border-ink bg-ink text-white"
                          : "border-line bg-surface text-ink hover:border-ink/30"
                      }`}
                    >
                      <span className={`text-xs ${on ? "text-white/80" : "text-ink-soft"}`}>{wd}</span>
                      <span className="mt-0.5 font-mono text-lg font-semibold">{dnum}</span>
                      <span className={`text-[11px] ${on ? "text-white/80" : "text-ink-soft"}`}>{month}</span>
                    </button>
                  );
                })}
              </div>

              {selectedDay && (
                <div className="mt-7">
                  <p className="mb-3 text-sm text-ink-soft">Créneaux disponibles · {fmtLong(selectedDay.date)}</p>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {selectedDay.hours.map((h) => {
                      const on = hour === h;
                      return (
                        <button
                          key={h}
                          onClick={() => setHour(h)}
                          className={`flex items-center justify-center gap-1.5 rounded-xl border py-3.5 text-sm font-medium transition-all active:scale-[0.97] ${
                            on
                              ? "border-ink bg-ink text-white"
                              : "border-line bg-surface text-ink hover:border-ink/30"
                          }`}
                        >
                          <Clock className={`h-4 w-4 ${on ? "text-white" : "text-ink-soft"}`} />
                          {slotLabel(h)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {!selectedDay && (
                <p className="mt-7 rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-ink-soft">
                  Choisissez d&apos;abord un jour ci-dessus.
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* ----- ÉTAPE COORDONNÉES ----- */}
      {step === "coords" && (
        <div className="grid gap-5">
          <Field label="Nom et prénom" error={touched && nom.trim().length < 2 ? "Indiquez votre nom." : null}>
            <input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Camille Aït-Larbi"
              autoComplete="name"
              className="input"
            />
          </Field>
          <Field label="Adresse email" error={touched && !isEmail(email) ? "Email invalide." : null}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@email.fr"
              inputMode="email"
              autoComplete="email"
              className="input"
            />
          </Field>
          <Field
            label="Téléphone mobile"
            hint="Pour la confirmation et le rappel par SMS."
            error={touched && !isPhoneFR(tel) ? "Numéro français invalide." : null}
          >
            <input
              value={tel}
              onChange={(e) => setTel(e.target.value)}
              placeholder="06 12 34 56 78"
              inputMode="tel"
              autoComplete="tel"
              className="input"
            />
          </Field>
          {type === "suivi_dossier" && (
            <Field
              label="Nom du dossier"
              hint="Pour retrouver votre dossier en cours."
              error={touched && dossier.trim().length < 2 ? "Indiquez le nom du dossier." : null}
            >
              <input
                value={dossier}
                onChange={(e) => setDossier(e.target.value)}
                placeholder="Ex. Aït-Larbi c/ Société Delta"
                className="input"
              />
            </Field>
          )}
        </div>
      )}

      {/* ----- ÉTAPE PAIEMENT ----- */}
      {step === "paiement" && (
        <div className="grid gap-3">
          <ChoiceCard
            active={paiement === "cb"}
            onClick={() => setPaiement("cb")}
            icon={<CreditCard className="h-5 w-5" />}
            title="Carte bancaire"
            desc="Paiement immédiat et sécurisé. Votre créneau est réservé dès la validation."
            tag={`${PRIX} € TTC`}
          />
          <ChoiceCard
            active={paiement === "especes"}
            onClick={() => setPaiement("especes")}
            icon={<Cash className="h-5 w-5" />}
            title="Espèces au cabinet"
            desc="À régler le jour du rendez-vous. Confirmation envoyée par email et SMS."
            tag={`${PRIX} €`}
          />
          <p className="mt-1 flex items-center gap-2 text-xs text-ink-soft">
            <Lock className="h-3.5 w-3.5" /> Paiement par carte traité par Stripe. Aucune donnée bancaire ne transite
            par le cabinet.
          </p>
        </div>
      )}

      {/* ----- ÉTAPE RÉCAP ----- */}
      {step === "recap" && (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <Row label="Type">
            {type === "consultation" ? "Première consultation" : "Suivi de dossier"}
          </Row>
          <Row label="Date">{date ? fmtLong(date) : "—"}</Row>
          <Row label="Heure">{hour !== null ? slotLabel(hour) : "—"}</Row>
          <Row label="Nom">{nom}</Row>
          <Row label="Email">{email}</Row>
          <Row label="Téléphone">{tel}</Row>
          {type === "suivi_dossier" && <Row label="Dossier">{dossier}</Row>}
          {type === "consultation" && (
            <Row label="Paiement">{paiement === "cb" ? "Carte bancaire" : "Espèces au cabinet"}</Row>
          )}
          <div className="flex items-center justify-between bg-ink px-5 py-4 text-paper">
            <span className="text-sm text-paper/70">Total</span>
            <span className="font-mono text-lg font-semibold">
              {montant === 0 ? "Sans frais" : `${montant} € TTC`}
            </span>
          </div>
        </div>
      )}

      {submitError && (
        <p className="mt-4 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {submitError}
        </p>
      )}

      {/* Barre d'action collante */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-5 py-3.5 sm:px-8">
          {idx > 0 && (
            <button
              onClick={goBack}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-3 text-sm text-ink transition-colors hover:border-ink/40 disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" /> Retour
            </button>
          )}
          {step !== "recap" ? (
            <button
              onClick={() => {
                if (!canContinue) {
                  setTouched(true);
                  return;
                }
                goNext();
              }}
              className={`group ml-auto inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-medium transition-all active:translate-y-px sm:flex-none ${
                canContinue
                  ? "bg-ink text-white hover:bg-[#243556]"
                  : "cursor-not-allowed bg-line text-ink-soft"
              }`}
            >
              Continuer
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting}
              className="ml-auto inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[15px] font-medium text-white transition-all hover:bg-[#243556] active:translate-y-px disabled:opacity-60 sm:flex-none"
            >
              {submitting ? (
                "Traitement…"
              ) : type === "consultation" && paiement === "cb" ? (
                <>
                  <Lock className="h-4 w-4" /> Payer {montant} €
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" /> Confirmer le rendez-vous
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(var(--line));
          background: rgb(var(--surface));
          padding: 0.85rem 1rem;
          font-size: 16px;
          color: rgb(var(--ink));
          transition: border-color 0.15s;
        }
        :global(.input::placeholder) {
          color: rgb(var(--ink-soft) / 0.55);
        }
        :global(.input:focus) {
          outline: none;
          border-color: rgb(var(--accent));
        }
      `}</style>
    </div>
  );
}

/* ---------- Sous-composants ---------- */

function ChoiceCard({
  active,
  onClick,
  icon,
  title,
  desc,
  tag,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
  tag: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-start gap-4 rounded-2xl border p-5 text-left transition-all active:scale-[0.99] ${
        active ? "border-accent bg-accent/[0.04] ring-1 ring-accent" : "border-line bg-surface hover:border-ink/30"
      }`}
    >
      <span
        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          active ? "bg-ink text-white" : "bg-paper text-ink"
        }`}
      >
        {icon}
      </span>
      <span className="flex-1">
        <span className="flex items-center justify-between gap-3">
          <span className="font-display text-lg font-medium">{title}</span>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 font-mono text-xs ${
              active ? "bg-ink text-white" : "bg-paper text-ink-soft"
            }`}
          >
            {tag}
          </span>
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-ink-soft">{desc}</span>
      </span>
    </button>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
      {error ? (
        <span className="text-xs text-danger">{error}</span>
      ) : hint ? (
        <span className="text-xs text-ink-soft">{hint}</span>
      ) : null}
    </label>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
      <span className="text-sm text-ink-soft">{label}</span>
      <span className="text-right text-sm font-medium text-ink">{children}</span>
    </div>
  );
}

function AvailabilitySkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-3 h-4 w-28 rounded bg-line" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-[78px] w-[68px] rounded-2xl bg-line" />
        ))}
      </div>
      <div className="mt-7 grid grid-cols-3 gap-2.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-line" />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-12 text-center">
      <Clock className="mx-auto h-7 w-7 text-ink-soft" />
      <p className="mx-auto mt-3 max-w-xs text-sm text-ink-soft">{text}</p>
    </div>
  );
}
