# LRT

Application Next.js TypeScript avec Tailwind CSS pour creer et gerer des reparations.
Elle peut utiliser PostgreSQL avec Prisma ou Firebase Firestore.

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
DATABASE_PROVIDER
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
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
SUPPORT_EMAIL
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

Si `DATABASE_PROVIDER="firebase"`, les commandes de migration Prisma ne sont pas necessaires.

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

Les variables SMTP serveur sont aussi utilisees pour envoyer les codes de validation a l'inscription, a chaque connexion admin et pour la recuperation de mot de passe. En production, renseignez `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` et `SMTP_FROM` dans Vercel. L'adresse service client conseillee est `lrt.service.client@gmail.com`.

La page `/service-client` envoie les demandes a `SUPPORT_EMAIL`. Si cette variable est vide, l'application utilise `SMTP_FROM` ou `SMTP_USER`.

Quand une reparation passe au statut `PRET`, un email est envoye au client si la configuration email est complete et si `readyEmailSent` vaut `false`. Si l'email n'est pas configure, l'application continue sans erreur.

Pour activer le paiement Stripe, renseigner `STRIPE_SECRET_KEY` cote serveur et `STRIPE_WEBHOOK_SECRET` pour le webhook. Une cle secrete visible dans une capture ou un message doit etre revoquee dans Stripe puis remplacee par une nouvelle.

## Firebase sur Vercel

Pour utiliser Firebase a la place de PostgreSQL sur Vercel :

```text
DATABASE_PROVIDER="firebase"
FIREBASE_PROJECT_ID="id-du-projet"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-...@id-du-projet.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Dans Firebase, utilisez Firestore en mode production, puis creez une cle de compte de service dans les parametres du projet. La cle privee doit garder les `\n` dans Vercel.
