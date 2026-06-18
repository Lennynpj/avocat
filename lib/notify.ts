import { CABINET, PRIX_CONSULTATION } from "@/lib/config";
import { sendEmail, emailLayout } from "@/lib/email";
import { sendSms } from "@/lib/sms";
import { formatDateLong, slotStart } from "@/lib/dates";
import type { Booking } from "@/lib/types";

function when(b: Booking): string {
  return `${formatDateLong(b.date)} à ${slotStart(b.hour)}`;
}
function typeLabel(b: Booking): string {
  return b.type === "consultation" ? "Première consultation" : "Suivi de dossier";
}
function p(text: string): string {
  return `<p style="margin:0 0 10px;color:#3d4252;line-height:1.55;">${text}</p>`;
}
function tag(text: string): string {
  return `<div style="display:inline-block;margin:4px 0 14px;padding:8px 14px;border-radius:8px;background:#eef1f6;color:#243556;font-weight:700;font-size:14px;">${text}</div>`;
}

async function notifyAvocat(subject: string, bodyLines: string[]) {
  await sendEmail({
    to: CABINET.emailNotif,
    subject: `[Agenda] ${subject}`,
    html: emailLayout(subject, bodyLines.map(p).join("")),
  });
}

/** À la création : confirmation espèces ou suivi de dossier (le CB passe par notifyPaid). */
export async function notifyBookingCreated(b: Booking): Promise<void> {
  const tasks: Promise<unknown>[] = [];

  if (b.paiement === "especes") {
    tasks.push(
      sendEmail({
        to: b.client.email,
        subject: "Votre rendez-vous est enregistré — à régler en espèces",
        html: emailLayout(
          "Rendez-vous enregistré",
          p(`Bonjour ${b.client.nom},`) +
            p(`Votre <strong>${typeLabel(b).toLowerCase()}</strong> est réservée pour le <strong>${when(b)}</strong>.`) +
            tag(`À PAYER EN ESPÈCES · ${PRIX_CONSULTATION} € au cabinet`) +
            p(`Le rendez-vous sera confirmé par le cabinet. En cas d'empêchement, contactez le 01 43 32 05 84.`),
        ),
      }),
    );
    tasks.push(
      sendSms({
        to: b.client.telephone,
        text: `Cabinet NGANGA : RDV ${formatDateLong(b.date)} a ${slotStart(b.hour)} enregistre. A regler en especes (${PRIX_CONSULTATION}E) au cabinet.`,
      }),
    );
    tasks.push(
      notifyAvocat("Nouveau RDV — espèces", [
        `${b.client.nom} — ${typeLabel(b)}`,
        `${when(b)}`,
        `Paiement : espèces (${PRIX_CONSULTATION} €) · ${b.client.telephone}`,
        b.source === "telephone" ? "Réservation prise par téléphone." : "Réservation en ligne.",
      ]),
    );
  } else if (b.type === "suivi_dossier") {
    tasks.push(
      sendEmail({
        to: b.client.email,
        subject: "Votre rendez-vous de suivi de dossier est confirmé",
        html: emailLayout(
          "Rendez-vous confirmé",
          p(`Bonjour ${b.client.nom},`) +
            p(`Votre <strong>rendez-vous de suivi de dossier</strong> est confirmé pour le <strong>${when(b)}</strong>.`) +
            (b.dossier ? p(`Dossier : <strong>${b.dossier}</strong>`) : "") +
            p(`Aucun paiement n'est requis pour ce rendez-vous.`),
        ),
      }),
    );
    tasks.push(
      sendSms({
        to: b.client.telephone,
        text: `Cabinet NGANGA : RDV de suivi confirme le ${formatDateLong(b.date)} a ${slotStart(b.hour)}.`,
      }),
    );
    tasks.push(
      notifyAvocat("Nouveau RDV — suivi de dossier", [
        `${b.client.nom}`,
        `${when(b)}`,
        b.dossier ? `Dossier : ${b.dossier}` : "Dossier non précisé",
        `${b.client.telephone}`,
      ]),
    );
  }

  await Promise.allSettled(tasks);
}

/** Paiement CB confirmé (webhook Stripe ou simulation locale). */
export async function notifyPaid(b: Booking): Promise<void> {
  await Promise.allSettled([
    sendEmail({
      to: b.client.email,
      subject: "Paiement confirmé — votre rendez-vous est réservé",
      html: emailLayout(
        "Paiement confirmé",
        p(`Bonjour ${b.client.nom},`) +
          p(`Votre paiement de <strong>${PRIX_CONSULTATION} € TTC</strong> a bien été reçu.`) +
          p(`Votre <strong>première consultation</strong> est confirmée pour le <strong>${when(b)}</strong>.`) +
          p(`Un rappel vous sera envoyé la veille. En cas d'empêchement, appelez le 01 43 32 05 84.`),
      ),
    }),
    sendSms({
      to: b.client.telephone,
      text: `Cabinet NGANGA : paiement recu. Consultation confirmee le ${formatDateLong(b.date)} a ${slotStart(b.hour)}.`,
    }),
    notifyAvocat("Nouveau RDV — payé en ligne", [
      `${b.client.nom} — Première consultation`,
      `${when(b)}`,
      `Paiement CB : ${PRIX_CONSULTATION} € · ${b.client.telephone}`,
    ]),
  ]);
}

/** Remboursement effectué. */
export async function notifyRefund(b: Booking): Promise<void> {
  await Promise.allSettled([
    sendEmail({
      to: b.client.email,
      subject: "Remboursement de votre consultation",
      html: emailLayout(
        "Remboursement effectué",
        p(`Bonjour ${b.client.nom},`) +
          p(`Le rendez-vous du <strong>${when(b)}</strong> a été annulé.`) +
          p(`Un remboursement de <strong>${PRIX_CONSULTATION} € TTC</strong> a été émis. Il apparaîtra sur votre relevé sous quelques jours.`),
      ),
    }),
    sendSms({
      to: b.client.telephone,
      text: `Cabinet NGANGA : votre RDV du ${formatDateLong(b.date)} est annule, remboursement de ${PRIX_CONSULTATION}E emis.`,
    }),
  ]);
}

/** Rappel 24h — au client ET à l'avocat (email + SMS). */
export async function notifyReminder(b: Booking): Promise<void> {
  const especes = b.paiement === "especes";
  await Promise.allSettled([
    sendEmail({
      to: b.client.email,
      subject: "Rappel — votre rendez-vous demain",
      html: emailLayout(
        "Rappel de rendez-vous",
        p(`Bonjour ${b.client.nom},`) +
          p(`Nous vous rappelons votre <strong>${typeLabel(b).toLowerCase()}</strong> le <strong>${when(b)}</strong>.`) +
          (especes ? tag(`À régler en espèces · ${PRIX_CONSULTATION} €`) : "") +
          p(`12 Allée du Platane Fourchu, 93390 Clichy-sous-bois.`),
      ),
    }),
    sendSms({
      to: b.client.telephone,
      text: `Rappel Cabinet NGANGA : RDV demain ${slotStart(b.hour)} (${formatDateLong(b.date)}).${especes ? ` A regler en especes ${PRIX_CONSULTATION}E.` : ""}`,
    }),
    sendSms({
      to: CABINET.telephoneE164,
      text: `Rappel agenda : ${b.client.nom} demain ${slotStart(b.hour)} — ${typeLabel(b)}.`,
    }),
    notifyAvocat("Rappel — RDV demain", [`${b.client.nom} — ${typeLabel(b)}`, `${when(b)}`, `${b.client.telephone}`]),
  ]);
}
