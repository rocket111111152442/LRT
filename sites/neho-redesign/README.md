# Neho Redesign — concept de refonte (non officiel)

> **Concept de refonte privé, non affilié à Neho SA.** Ce dépôt n'est pas le
> site officiel neho.ch et ne doit jamais être présenté comme tel. Voir
> `src/config/site.ts` (`legalDisclaimer`) et le pied de page de chaque page.

Refonte complète (design, UX, architecture) du site vitrine d'une agence
immobilière suisse en ligne au forfait fixe, réalisée à titre de
démonstration pour une présentation privée. L'activité, les offres et les
informations publiques de Neho sont conservées fidèlement dans l'esprit ;
aucune donnée personnelle ni aucun bien réel n'est reproduit — voir
`docs/neho-audit.md` à la racine du dépôt et `src/lib/data/README.md`.

## Stack

- Next.js 16 (App Router, Turbopack), TypeScript strict
- Tailwind CSS v4 (design tokens en `@theme`, voir `src/app/[locale]/globals.css`)
- GSAP + ScrollTrigger pour les animations, React Three Fiber pour la scène
  3D légère du hero (avec repli statique automatique)
- Zod pour la validation des formulaires (client + serveur)
- Contenu structuré en TypeScript typé (`src/lib/data`), y compris les
  articles de blog en blocs typés (titre/paragraphe/liste/citation),
  directement prêts à être alimentés par un CMS headless — voir
  `src/lib/data/blog.ts` et `src/lib/data/README.md`
- i18n natif App Router : `fr` (complet) et `en` (démonstration) sous
  `src/app/[locale]`

## Démarrer

```bash
cd sites/neho-redesign
npm install
cp .env.example .env.local   # optionnel pour la démo, voir commentaires
npm run dev
```

- `npm run lint` — ESLint (flat config, Next.js 16 : plus de `next lint`)
- `npm run typecheck` — `tsc --noEmit`
- `npm run build` — build de production (Turbopack)
- `npm test` — tests unitaires (validations, calculateur, données)

## Ce qui est réel vs démonstration

- **Réel / structurel** : architecture Next.js, design system, composants,
  logique des formulaires, validations, calculs, SEO technique,
  accessibilité, sécurité (voir `SECURITY.md`).
- **Démonstration, clairement identifiée sur le site** : biens immobiliers,
  agents, témoignages, articles de blog, statistiques locales par commune.
  Voir `src/lib/data/README.md` pour la structure prête à connecter à une
  vraie API/CRM.
- **Chiffres à vérifier avant toute diffusion** : voir
  `src/config/site-numbers.ts` (chaque valeur porte un indicateur
  `verified: boolean` et une source) et `docs/neho-audit.md` §13.

## Déploiement (Vercel)

- **Root Directory** du projet Vercel : `sites/neho-redesign`
- **Framework Preset** : Next.js
- Variables d'environnement : voir `.env.example`. Sans elles, les
  formulaires valident et journalisent la demande côté serveur mais
  n'envoient pas d'e-mail réel (voir `src/app/api/contact/route.ts`).
