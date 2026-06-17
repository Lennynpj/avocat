# Déploiement sur un VPS OVH avec le domaine slidecraft.fr

Guide pas-à-pas pour faire tourner l'app Next.js sur un VPS OVH, derrière Nginx, en **HTTPS** sur **slidecraft.fr**.

> Toutes les commandes se lancent en **SSH** sur le serveur : `ssh ubuntu@VOTRE_IP` (ou `root@VOTRE_IP`).
> Remplacez `VOTRE_IP` par l'IP publique de votre VPS (visible dans l'espace OVH).

---

## 0. DNS (OVH) + Atlas — à faire en premier

**a) Pointer le domaine vers le VPS.** Espace OVH → *Noms de domaine* → `slidecraft.fr` → **Zone DNS**, créez/modifiez :

| Type | Sous-domaine | Cible |
|------|--------------|-------|
| A | (vide / `slidecraft.fr`) | `VOTRE_IP` |
| A | `www` | `VOTRE_IP` |

> La propagation prend de quelques minutes à ~1 h. Vérifiez avec `dig +short slidecraft.fr` (doit renvoyer votre IP) avant l'étape HTTPS.
> Si `slidecraft.fr` héberge déjà autre chose, utilisez plutôt un sous-domaine (ex. `avocat`) et adaptez `server_name` + certbot.

**b) Autoriser le VPS dans MongoDB Atlas.** Atlas → **Network Access** → *Add IP Address* → l'IP publique du VPS (ou `0.0.0.0/0`).

---

## 1. Installer Node.js 20, git et Nginx

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx
node -v   # doit afficher v20.x
```

## 2. Récupérer le code

```bash
sudo mkdir -p /var/www && sudo chown $USER:$USER /var/www
cd /var/www
git clone https://github.com/Lennynpj/avocat.git cabinet
cd cabinet
```

> **Repo privé ?** `git clone https://VOTRE_TOKEN@github.com/Lennynpj/avocat.git cabinet`
> (token sur github.com → Settings → Developer settings → Personal access tokens, scope `repo`).

## 3. Variables d'environnement

Générez deux secrets :

```bash
openssl rand -hex 32   # SESSION_SECRET
openssl rand -hex 16   # CRON_SECRET
```

Créez `.env.local` :

```bash
nano .env.local
```

```env
TZ=Europe/Paris
NEXT_PUBLIC_SITE_URL=https://slidecraft.fr

# Admin
ADMIN_PASSWORD=un-mot-de-passe-solide
SESSION_SECRET=collez-le-openssl-rand-hex-32

# MongoDB Atlas (avec le NOUVEAU mot de passe régénéré)
MONGODB_URI=mongodb+srv://lenny30_db_user:NOUVEAU_MDP@cluster0.eo7r3wy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DB=cabinet_nganga

# Rappels 24h
CRON_SECRET=collez-le-openssl-rand-hex-16

# Stripe / Resend / smsmode : à remplir quand vous activerez ces services
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
EMAIL_FROM=Cabinet NGANGA <onboarding@resend.dev>
SMSMODE_API_KEY=
SMS_SENDER=CabinetAv
```

> `NEXT_PUBLIC_SITE_URL` est figé **au build**. Il est déjà en `https://slidecraft.fr` : on installe le certificat juste après, donc tout sera cohérent.

## 4. Installer les dépendances et construire

```bash
npm ci
npm run build
```

> VPS < 2 Go de RAM et build « Killed » ? Ajoutez du swap :
> `sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile`

## 5. Lancer l'app avec PM2

```bash
sudo npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup        # exécutez la commande "sudo env ..." affichée
pm2 status         # doit être "online"
```

## 6. Nginx (port 80 → app)

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/cabinet
sudo ln -s /etc/nginx/sites-available/cabinet /etc/nginx/sites-enabled/cabinet
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

## 7. Pare-feu

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

## 8. HTTPS gratuit (Let's Encrypt)

> À faire une fois que `dig +short slidecraft.fr` renvoie bien l'IP du VPS.

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d slidecraft.fr -d www.slidecraft.fr
```

Choisissez la redirection HTTP → HTTPS quand certbot le propose. Le renouvellement est automatique.

## 9. Rappels automatiques 24h (cron)

`crontab -e` puis (remplacez par votre `CRON_SECRET`) :

```cron
0 7,16 * * * curl -s -H "Authorization: Bearer VOTRE_CRON_SECRET" http://127.0.0.1:3000/api/cron/reminders >/dev/null 2>&1
```

## ✅ Tester

Ouvrez **https://slidecraft.fr** — et l'admin sur **https://slidecraft.fr/admin**.

---

## Mettre à jour le site (après un nouveau push GitHub)

```bash
cd /var/www/cabinet
git pull
npm ci
npm run build
pm2 reload cabinet-nganga
```

## Dépannage

| Symptôme | Piste |
|---|---|
| certbot échoue | DNS pas encore propagé → attendez et vérifiez `dig +short slidecraft.fr` |
| 502 Bad Gateway | l'app n'est pas lancée → `pm2 status`, `pm2 logs cabinet-nganga` |
| Erreur MongoDB / timeout | IP du VPS pas autorisée dans Atlas → Network Access |
| Build « Killed » | manque de RAM → ajouter du swap (étape 4) |
| Page blanche après update | `npm run build` non relancé après le `git pull` |
