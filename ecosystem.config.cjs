// Configuration PM2 — démarre le serveur Next.js en production.
//   pm2 start ecosystem.config.cjs
// Les secrets (MONGODB_URI, ADMIN_PASSWORD, …) sont lus par Next depuis
// le fichier .env.local au démarrage — ne pas les mettre ici.
module.exports = {
  apps: [
    {
      name: "cabinet-nganga",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        TZ: "Europe/Paris",
        PORT: "3000",
      },
    },
  ],
};
