# Cabinet NGANGA — Prise de rendez-vous en ligne

Site de prise de rendez-vous + paiement pour Maître Jean Vivien NGANGA, avocat au Barreau de Bobigny.
Next.js (App Router) · TypeScript · Tailwind. **POC sans base de données** (fichier JSON), prêt pour Vercel.

## Démarrage en local

```bash
npm install
cp .env.example .env.local   # tout peut rester vide pour un test local
npm run dev
```

Ouvrir http://localhost:3000

- **Site public** : `/` puis « Prendre rendez-vous »
- **Espace cabinet (admin)** : `/admin` — mot de passe par défaut `cabinet93`
  (modifiable via `ADMIN_PASSWORD` dans `.env.local`)

> En local sans clés, l'app **simule** les paiements (le RDV passe direct en « payé »)
> et **logge** les emails/SMS dans la console. Aucune configuration n'est nécessaire pour tester l'UX.

## Comment ça marche

- **Données** : tout passe par l'interface `lib/store/BookingStore.ts`. L'implémentation POC
  `JsonFileStore` lit/écrit `data/db.json`. Pour passer en production, créer un `PostgresStore`
  et changer une seule ligne dans `lib/store/index.ts` — rien d'autre à toucher.
- **Créneaux** : Lun–Ven, 1h (10·11·12·13·15·16·17h), délai mini 2h. Réglages dans `lib/config.ts`.
- **Paiement** : Stripe Checkout (consultation 120 € TTC). Espèces et suivi de dossier = sans paiement en ligne.
- **Notifications** : email via Resend, SMS via Brevo. Rappel 24h via Vercel Cron (`vercel.json`).

## Activer les services réels (Phase 1)

Renseigner dans `.env.local` (voir `.env.example`) :

| Service | Variables | Sans la clé |
|--------|-----------|-------------|
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | paiement CB simulé |
| Email (Resend) | `RESEND_API_KEY`, `EMAIL_FROM` | emails loggés en console |
| SMS (Brevo) | `BREVO_API_KEY`, `SMS_SENDER` | SMS loggés en console |
| Rappels | `CRON_SECRET` | endpoint non protégé |

### Webhook Stripe en local

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copier le `whsec_...` affiché dans `STRIPE_WEBHOOK_SECRET`.

## Déploiement Vercel

1. Importer le repo sur Vercel.
2. Définir les variables d'environnement (au minimum `TZ=Europe/Paris`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL`).
3. Le cron des rappels est déclaré dans `vercel.json`.

> ⚠️ Le `JsonFileStore` n'est **pas persistant sur Vercel** (système de fichiers éphémère) :
> les RDV créés en ligne y seront perdus. Pour une démo Vercel qui sauvegarde réellement,
> brancher un `PostgresStore` (Supabase/Neon) — l'abstraction est déjà en place. (Phase 1)

## À finaliser avant mise en production

- Mentions légales / CGV : compléter les `[À compléter]` (SIREN, TVA, médiateur de la consommation).
- Remplacer le `JsonFileStore` par une vraie base (Phase 1).
- Brancher Resend (domaine vérifié) et Brevo (crédits SMS).
- Authentification admin renforcée (le POC utilise un simple mot de passe).
