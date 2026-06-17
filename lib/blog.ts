// ============================================================
//  Contenu du Journal (blog) — SEO local + GEO.
//  Sans BDD : les articles sont des données typées, rendues en statique.
//  Pour en ajouter un : copier un objet et compléter les champs.
// ============================================================

export interface FaqItem {
  q: string;
  a: string;
}

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "callout"; text: string };

export interface Article {
  slug: string;
  title: string;
  category: string;
  date: string; // ISO (publication)
  updated?: string;
  readingMinutes: number;
  description: string; // méta + extrait
  keywords: string[];
  answer: string; // « réponse rapide » concise et citable (GEO)
  blocks: Block[];
  faq: FaqItem[];
}

const DISCLAIMER =
  "Cet article a une vocation d'information générale et ne constitue pas un conseil juridique personnalisé. Chaque situation est particulière : pour un avis adapté, prenez rendez-vous avec le cabinet.";

export const ARTICLES: Article[] = [
  {
    slug: "oqtf-recours-delais",
    title: "OQTF : quels recours et quels délais pour la contester ?",
    category: "Droit des étrangers",
    date: "2026-05-14",
    updated: "2026-06-02",
    readingMinutes: 6,
    description:
      "OQTF (obligation de quitter le territoire français) : délais de recours, procédure devant le tribunal administratif et pourquoi agir vite avec un avocat en Seine-Saint-Denis.",
    keywords: ["OQTF", "recours OQTF", "avocat droit des étrangers Bobigny", "tribunal administratif Montreuil", "obligation de quitter le territoire"],
    answer:
      "Une OQTF peut être contestée devant le tribunal administratif. Le délai est très court — 48 heures en cas de placement en rétention, sinon 15 ou 30 jours selon la décision. Passé ce délai, le recours n'est plus recevable : il est donc indispensable de consulter un avocat sans attendre.",
    blocks: [
      { type: "h2", text: "Qu'est-ce qu'une OQTF ?" },
      { type: "p", text: "L'obligation de quitter le territoire français (OQTF) est une décision administrative par laquelle la préfecture demande à un ressortissant étranger de quitter la France. Elle est souvent assortie d'un délai de départ volontaire de 30 jours, mais peut être prononcée sans délai, parfois avec une interdiction de retour." },
      { type: "h2", text: "Quels sont les délais pour contester une OQTF ?" },
      { type: "p", text: "Les délais varient selon le type de décision et votre situation. Ils sont brefs et impératifs :" },
      { type: "ul", items: [
        "48 heures en cas de placement en rétention ou d'assignation à résidence ;",
        "15 jours pour certaines OQTF sans délai de départ volontaire ;",
        "30 jours pour une OQTF assortie d'un délai de départ volontaire.",
      ] },
      { type: "callout", text: "Le décompte commence dès la notification de la décision. Un seul jour de retard rend le recours irrecevable." },
      { type: "h2", text: "Comment se déroule la contestation ?" },
      { type: "p", text: "Le recours s'exerce devant le tribunal administratif compétent — pour la Seine-Saint-Denis, le tribunal administratif de Montreuil. L'avocat rédige une requête motivée et peut, selon les cas, demander la suspension de la mesure. L'audience intervient ensuite dans des délais qui dépendent de la procédure (référé ou procédure d'urgence)." },
      { type: "h2", text: "Pourquoi agir vite avec un avocat ?" },
      { type: "p", text: "La brièveté des délais et la technicité du droit des étrangers rendent l'accompagnement d'un avocat déterminant. Le cabinet, situé à Clichy-sous-bois et intervenant devant les juridictions du 93, peut analyser votre situation et engager le recours dans les temps." },
      { type: "callout", text: DISCLAIMER },
    ],
    faq: [
      { q: "Puis-je rester en France pendant le recours contre l'OQTF ?", a: "Lorsque le recours est formé dans le délai et qu'il existe un caractère suspensif, l'éloignement ne peut en principe pas être exécuté avant la décision du juge. Tout dépend du type d'OQTF : un avocat vérifie le caractère suspensif applicable à votre situation." },
      { q: "Que se passe-t-il si je dépasse le délai de recours ?", a: "Le recours devient irrecevable et l'OQTF peut être exécutée. Dans certains cas, d'autres démarches restent envisageables (demande de titre, réexamen), mais elles sont plus limitées. D'où l'importance de consulter immédiatement." },
      { q: "Un avocat est-il obligatoire pour contester une OQTF ?", a: "L'avocat n'est pas toujours juridiquement obligatoire, mais il est vivement recommandé compte tenu des délais et de la complexité de la procédure. L'aide juridictionnelle peut, sous conditions, prendre en charge les honoraires." },
    ],
  },
  {
    slug: "garde-a-vue-droits",
    title: "Garde à vue : quels sont vos droits ?",
    category: "Droit pénal",
    date: "2026-04-22",
    readingMinutes: 5,
    description:
      "Garde à vue : durée, droit à l'avocat, droit au silence, examen médical. Ce que vous pouvez exiger dès la première heure, expliqué par un avocat pénaliste à Bobigny.",
    keywords: ["garde à vue", "droits garde à vue", "avocat pénaliste Bobigny", "droit au silence", "avocat garde à vue 93"],
    answer:
      "Dès le début d'une garde à vue, vous avez le droit d'être assisté par un avocat, de garder le silence, d'être examiné par un médecin, de faire prévenir un proche et votre employeur, et d'être informé des faits reprochés. La durée initiale est de 24 heures, renouvelable une fois sur autorisation du procureur.",
    blocks: [
      { type: "h2", text: "Qu'est-ce qu'une garde à vue ?" },
      { type: "p", text: "La garde à vue est une mesure par laquelle une personne soupçonnée d'une infraction est retenue par les services de police ou de gendarmerie pour les besoins de l'enquête. Elle est strictement encadrée par le Code de procédure pénale." },
      { type: "h2", text: "Quels sont vos droits pendant la garde à vue ?" },
      { type: "ul", items: [
        "Être informé de l'infraction reprochée et de sa qualification ;",
        "Être assisté par un avocat, dès le début et lors des auditions ;",
        "Garder le silence et ne pas s'auto-incriminer ;",
        "Être examiné par un médecin ;",
        "Faire prévenir un proche et votre employeur ;",
        "Bénéficier d'un interprète si nécessaire.",
      ] },
      { type: "h2", text: "Combien de temps dure une garde à vue ?" },
      { type: "p", text: "La durée initiale est de 24 heures. Elle peut être prolongée de 24 heures supplémentaires sur autorisation du procureur de la République, voire davantage pour certaines infractions (terrorisme, trafic de stupéfiants)." },
      { type: "h2", text: "Pourquoi appeler un avocat immédiatement ?" },
      { type: "p", text: "L'avocat s'assure du respect de vos droits, vous conseille avant les auditions et prépare la suite de la procédure. En cas de garde à vue d'un proche en Seine-Saint-Denis, le cabinet peut intervenir rapidement." },
      { type: "callout", text: DISCLAIMER },
    ],
    faq: [
      { q: "Dois-je répondre aux questions pendant la garde à vue ?", a: "Vous avez le droit de garder le silence. Il est souvent prudent d'attendre les conseils de votre avocat avant de vous exprimer sur les faits." },
      { q: "L'avocat peut-il assister à mes auditions ?", a: "Oui. Depuis la réforme de la garde à vue, l'avocat assiste aux auditions et confrontations et peut formuler des observations." },
      { q: "Comment contacter un avocat en urgence pour une garde à vue ?", a: "Vous pouvez demander expressément l'assistance d'un avocat aux enquêteurs. Vous, ou un proche, pouvez aussi appeler directement le cabinet au 01 43 32 05 84." },
    ],
  },
  {
    slug: "divorce-etapes-avocat",
    title: "Divorce : les grandes étapes et le rôle de l'avocat",
    category: "Droit de la famille",
    date: "2026-03-30",
    readingMinutes: 6,
    description:
      "Divorce amiable ou contentieux : les étapes, l'avocat obligatoire, la durée et la procédure devant le tribunal judiciaire de Bobigny.",
    keywords: ["divorce", "divorce amiable", "avocat divorce Bobigny", "tribunal judiciaire Bobigny", "avocat droit de la famille 93"],
    answer:
      "Il existe deux grandes voies : le divorce amiable (par consentement mutuel), rapide et sans juge dans la plupart des cas, et le divorce contentieux, jugé par le tribunal judiciaire. Dans tous les cas, chaque époux doit être assisté de son propre avocat.",
    blocks: [
      { type: "h2", text: "Quels sont les types de divorce ?" },
      { type: "p", text: "Le divorce par consentement mutuel se règle par une convention signée par les deux avocats et déposée chez un notaire, sans passage devant le juge dans la majorité des cas. Le divorce contentieux (acceptation du principe, altération définitive du lien conjugal, ou faute) est tranché par le juge aux affaires familiales." },
      { type: "h2", text: "Quelles sont les étapes d'un divorce contentieux ?" },
      { type: "ul", items: [
        "Dépôt d'une demande en divorce par avocat ;",
        "Audience d'orientation et sur mesures provisoires (logement, pension, enfants) ;",
        "Phase de mise en état et échanges entre avocats ;",
        "Jugement de divorce et liquidation du régime matrimonial.",
      ] },
      { type: "h2", text: "L'avocat est-il obligatoire ?" },
      { type: "p", text: "Oui. Le divorce — amiable comme contentieux — impose que chaque époux soit représenté par un avocat. Pour les habitants de Clichy-sous-bois et des communes voisines, la juridiction compétente est le tribunal judiciaire de Bobigny." },
      { type: "h2", text: "Combien de temps dure une procédure ?" },
      { type: "p", text: "Un divorce amiable peut aboutir en quelques semaines à quelques mois. Un divorce contentieux est plus long et dépend de la complexité du dossier et des points de désaccord (enfants, patrimoine, pension)." },
      { type: "callout", text: DISCLAIMER },
    ],
    faq: [
      { q: "Combien coûte un divorce ?", a: "Le coût dépend du type de divorce et de la complexité du dossier. Un divorce amiable est généralement moins onéreux. Le cabinet vous communique une estimation claire dès la première consultation." },
      { q: "Qui garde les enfants pendant la procédure ?", a: "Les modalités de garde sont fixées dès les mesures provisoires, dans l'intérêt de l'enfant. Elles peuvent prévoir une résidence alternée ou principale, avec un droit de visite et d'hébergement." },
      { q: "Peut-on divorcer sans passer devant un juge ?", a: "Oui, dans le cadre du divorce par consentement mutuel, qui se conclut par une convention contresignée par avocats et déposée chez un notaire, sauf cas particuliers (enfant demandant à être entendu, époux protégé)." },
    ],
  },
  {
    slug: "licenciement-contester",
    title: "Licenciement : comment le contester aux prud'hommes ?",
    category: "Droit du travail",
    date: "2026-02-18",
    readingMinutes: 5,
    description:
      "Contester un licenciement : motifs, délai de saisine du conseil de prud'hommes, indemnités. Les conseils d'un avocat en droit du travail en Seine-Saint-Denis.",
    keywords: ["licenciement", "contester un licenciement", "conseil de prud'hommes Bobigny", "avocat droit du travail 93", "licenciement sans cause réelle et sérieuse"],
    answer:
      "Un licenciement peut être contesté devant le conseil de prud'hommes lorsqu'il est dépourvu de cause réelle et sérieuse ou irrégulier. En principe, le salarié dispose de 12 mois à compter de la notification du licenciement pour saisir le conseil de prud'hommes.",
    blocks: [
      { type: "h2", text: "Quand un licenciement est-il contestable ?" },
      { type: "p", text: "Un licenciement doit reposer sur une cause réelle et sérieuse et respecter une procédure précise (entretien préalable, notification motivée). À défaut, il peut être jugé sans cause réelle et sérieuse, irrégulier, voire nul (discrimination, harcèlement)." },
      { type: "h2", text: "Quel est le délai pour agir ?" },
      { type: "p", text: "Le salarié dispose généralement de 12 mois à compter de la notification du licenciement pour saisir le conseil de prud'hommes. D'autres délais peuvent s'appliquer selon la nature de la demande (rappels de salaire, par exemple)." },
      { type: "callout", text: "Le délai court à compter de la notification : mieux vaut consulter rapidement pour préserver vos droits et réunir les preuves utiles." },
      { type: "h2", text: "Quelles indemnités pouvez-vous obtenir ?" },
      { type: "ul", items: [
        "Indemnité pour licenciement sans cause réelle et sérieuse ;",
        "Indemnités de rupture (préavis, licenciement) non versées ;",
        "Dommages et intérêts en cas de préjudice distinct.",
      ] },
      { type: "h2", text: "Le rôle de l'avocat" },
      { type: "p", text: "L'avocat évalue les chances de succès, chiffre les demandes et défend votre dossier devant le conseil de prud'hommes de Bobigny, compétent pour les salariés du secteur." },
      { type: "callout", text: DISCLAIMER },
    ],
    faq: [
      { q: "Combien de temps dure une procédure prud'homale ?", a: "Cela varie selon les juridictions et la complexité du dossier, généralement de plusieurs mois à plus d'un an, une phase de conciliation précédant le jugement." },
      { q: "Puis-je être accompagné pour une rupture conventionnelle ?", a: "Oui. Même si la rupture conventionnelle est amiable, l'avocat vérifie l'indemnité et la régularité de la procédure pour protéger vos intérêts." },
      { q: "L'avocat est-il obligatoire aux prud'hommes ?", a: "Non, mais son assistance est fortement recommandée pour constituer le dossier, chiffrer les demandes et plaider efficacement." },
    ],
  },
];

export function getAllArticles(): Article[] {
  return [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date));
}

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getRelated(slug: string, n = 2): Article[] {
  return getAllArticles()
    .filter((a) => a.slug !== slug)
    .slice(0, n);
}
