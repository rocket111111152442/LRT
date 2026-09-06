# Mes cours de Première

Application web personnelle pour suivre les cours de Première : fiches de
cours, agenda, suivi des notes/évaluations et documents. Multi-comptes :
chaque élève crée son propre compte protégé par mot de passe et ne voit
que ses données. Le profil s'adapte automatiquement à la classe (Première)
et aux spécialités choisies à l'inscription (3 maximum, modifiables plus
tard dans les paramètres).

C'est une application Next.js **indépendante** du reste de ce dépôt (elle
n'importe aucun code de Qoravo) : son propre `package.json`, son propre
schéma de base de données, son propre déploiement Vercel.

## Stack

- Next.js 16 (App Router, Server Actions)
- PostgreSQL + Prisma 7 (`@prisma/adapter-pg`)
- Authentification maison : mots de passe hashés avec `bcrypt`, sessions
  signées (HMAC-SHA256, Web Crypto) dans un cookie httpOnly — pas de
  dépendance externe type NextAuth.
- Tailwind CSS 4

## Installation

```bash
cd sites/cours-premiere
npm install
cp .env.example .env
```

Variables à renseigner dans `.env` :

```text
DATABASE_URL   # connexion PostgreSQL (Neon, Supabase, Vercel Postgres...)
AUTH_SECRET    # chaîne aléatoire longue (32+ caractères), pour signer les sessions
```

Générer une valeur pour `AUTH_SECRET` :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Créer les tables :

```bash
npm run prisma:migrate
```

Lancer en développement :

```bash
npm run dev
```

## Déploiement (Vercel)

1. Créer un nouveau projet Vercel pointant sur `sites/cours-premiere` comme
   racine du projet (Root Directory).
2. Renseigner `DATABASE_URL` (base PostgreSQL managée, ex. Neon ou Vercel
   Postgres) et `AUTH_SECRET` dans les variables d'environnement Vercel.
3. La commande de build (`npm run build`) exécute automatiquement
   `prisma generate`. Pensez à lancer `npx prisma migrate deploy` (avec
   `DATABASE_URL` de production) après la première mise en ligne pour créer
   les tables.

## Fonctionnement

- **Comptes** : inscription libre (email + mot de passe + choix des
  spécialités), chaque compte est isolé — un élève ne voit jamais les
  données d'un autre.
- **Matières** : calculées automatiquement à partir du tronc commun de
  Première générale (Français, Histoire-Géo/EMC, LV A, LV B, Enseignement
  scientifique, EPS) + les spécialités choisies. Le catalogue des
  spécialités est dans `src/lib/subjects.ts` — modifiable si de nouvelles
  options apparaissent.
- **Notes de cours** : fiches texte libres par matière.
- **Agenda** : cours, devoirs, contrôles avec date et matière optionnelle.
- **Notes/évaluations** : ajout de notes avec barème et coefficient,
  moyenne calculée par matière et moyenne générale pondérée.
- **Documents** : upload de fichiers (4 Mo max par fichier, stockés en
  base de données — pas de service de stockage externe configuré).

## Limites connues

- Les documents sont stockés directement en base PostgreSQL (colonne
  `Bytes`), ce qui est simple mais ne convient pas à de gros volumes ou de
  gros fichiers. Pour aller plus loin, brancher un stockage objet (S3,
  Vercel Blob...) serait la prochaine étape logique.
- Pas de récupération de mot de passe par email pour l'instant (pas de
  service SMTP configuré dans cette app) : en cas d'oubli, il faut
  recréer le mot de passe directement en base.
