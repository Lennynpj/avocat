// ============================================================
//  Source unique de vérité — informations du cabinet + règles métier
// ============================================================

export const CABINET = {
  avocat: "Maître Jean Vivien NGANGA",
  nomCourt: "Cabinet NGANGA",
  titre: "Docteur en droit · Avocat au Barreau de Bobigny",
  sermentISO: "2000-04-19",
  adresse: "12 Allée du Platane Fourchu",
  ville: "Clichy-sous-bois",
  codePostal: "93390",
  pays: "France",
  telephone: "01 43 32 05 84",
  telephoneE164: "+33143320584",
  // Email destinataire des notifications (RDV, remboursements…) — JAMAIS affiché publiquement.
  // Tests : lenny30@outlook.fr par défaut. En prod : définir EMAIL_AVOCAT=ngangaj@wanadoo.fr
  emailNotif: process.env.EMAIL_AVOCAT || "lenny30@outlook.fr",
  domaines: [
    {
      titre: "Droit pénal",
      desc: "Défense en garde à vue, comparution immédiate, instruction et audiences correctionnelles.",
    },
    {
      titre: "Droit des étrangers",
      desc: "Titres de séjour, OQTF, naturalisation, asile et contentieux devant la préfecture.",
    },
    {
      titre: "Droit de la famille",
      desc: "Divorce, séparation, autorité parentale, pensions et successions.",
    },
    {
      titre: "Droit du travail",
      desc: "Licenciement, rupture conventionnelle, harcèlement et contentieux prud'homal.",
    },
  ],
} as const;

// --- Tarifs ---
export const PRIX_CONSULTATION = 120; // € TTC
export const DEVISE = "eur";

// --- Agenda ---
export const JOURS_OUVRES = [1, 2, 3, 4, 5]; // lundi → vendredi (0 = dimanche)
export const HEURES_CRENEAUX = [10, 11, 12, 13, 15, 16, 17]; // 10h-14h et 15h-18h, créneaux d'1h
export const DUREE_CRENEAU_MIN = 60;
export const DELAI_MIN_HEURES = 2; // pas de réservation à moins de 2h
export const HORIZON_JOURS = 28; // fenêtre de réservation en ligne
export const HOLD_PENDING_MIN = 30; // un paiement CB non finalisé libère le créneau après 30 min

export const HORAIRES_AFFICHAGE = [
  { label: "Matin", plage: "10h00 – 14h00" },
  { label: "Après-midi", plage: "15h00 – 18h00" },
];
