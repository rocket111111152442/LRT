# LRT

Application Next.js TypeScript avec Tailwind CSS, Prisma et PostgreSQL pour creer et gerer des reparations.

## Installation

```bash
npm install
```

Copier le fichier d'environnement et renseigner les variables :

```powershell
Copy-Item .env.example .env
```

ou, avec un shell Unix :

```sh
cp .env.example .env
```

Variables importantes :

```text
DATABASE_URL
AUTH_SECRET
ADMIN_EMAIL
ADMIN_PASSWORD
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASSWORD
SMTP_FROM
SMTP_SECURE
SHOP_NAME
SHOP_ADDRESS
SHOP_OPENING_HOURS
SHOP_PHONE
```

Generer le client Prisma :

```bash
npm run prisma:generate
```

Creer et appliquer les migrations :

```bash
npm run prisma:migrate
```

Creer ou mettre a jour l'administrateur :

```bash
npm run prisma:seed
```

Lancer l'application :

```bash
npm run dev
```

Pages principales :

```text
http://localhost:3000/nouvelle-reparation
http://localhost:3000/admin/login
http://localhost:3000/admin
http://localhost:3000/admin/repairs/new
http://localhost:3000/admin/email
http://localhost:3000/admin/qr-code
http://localhost:3000/admin/guide
```

## Notes

Le statut initial d'une reparation creee par l'API publique est `PAS_ENCORE_EN_REPARATION`.

La configuration email peut etre saisie dans l'admin sur `/admin/email`. Les variables SMTP du fichier `.env` restent disponibles comme secours.

Quand une reparation passe au statut `PRET`, un email est envoye au client si la configuration email est complete et si `readyEmailSent` vaut `false`. Si l'email n'est pas configure, l'application continue sans erreur.

Pour activer le paiement Stripe, renseigner `STRIPE_SECRET_KEY` cote serveur et `STRIPE_WEBHOOK_SECRET` pour le webhook. Une cle secrete visible dans une capture ou un message doit etre revoquee dans Stripe puis remplacee par une nouvelle.
