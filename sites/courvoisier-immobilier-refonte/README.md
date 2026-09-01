# Courvoisier Immobilier — concept de refonte (non officiel)

Déploiement Vercel : projet `courvoisier-redesign-demo` (racine
`sites/courvoisier-immobilier-refonte`), branche `claude/courvoisier-immobilier-refonte-ubrsr8`.

Concept privé de refonte de [courvoisier.immo](https://www.courvoisier.immo/),
réalisé pour étude de direction artistique. **Aucune affiliation avec
Courvoisier Immobilier SA.** Ne pas diffuser comme un site officiel.

Voir `../../docs/courvoisier-audit.md` pour la méthodologie, les sources et
— point important — la liste des données qui n'ont pas pu être vérifiées
dans cet environnement (réseau de sortie restreint) et qui sont donc
traitées comme du **contenu de démonstration explicitement signalé**
plutôt que comme des faits réels de l'agence :

- les biens en vente/location autres que les deux promotions sourcées
  (Résidence NAMAYA, Résidence TerraVista) ;
- les textes de témoignages clients ;
- les articles de blog (gabarit éditorial, contenu générique de
  démonstration) ;
- toute photographie : en l'absence d'accès aux visuels réels de
  l'agence, le protagoniste visuel est un système d'illustrations
  architecturales dessinées pour ce projet (`src/components/illustrations`)
  plutôt que des photos de banque d'images.

## Installation

```bash
npm install
cp .env.example .env.local
npm run dev
```

Le site tourne alors sur `http://localhost:3000`.

## Scripts

```bash
npm run dev        # serveur de développement
npm run build      # build de production
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm run test         # tests unitaires (tsx --test)
```

## Formulaires

Les formulaires (contact, estimation, demande de visite) sont validés côté
serveur (Zod) et protégés par limitation de débit + honeypot anti-spam.
Sans `RESEND_API_KEY` / `CONTACT_TO` / `CONTACT_FROM` renseignés dans
`.env.local`, les demandes sont journalisées côté serveur mais aucun
e-mail n'est réellement envoyé — voir `.env.example`.

## Architecture

```text
src/
  app/                 routes (App Router)
  components/
    layout/            header, footer, menu mobile
    home/               sections de la page d'accueil
    properties/         listing + fiche bien
    promotions/         listing + fiche promotion
    forms/               formulaires (contact, estimation multi-étapes)
    illustrations/       système d'illustrations architecturales (SVG)
    ui/                   primitives (bouton, lien animé, étiquette…)
    seo/                  JSON-LD
  lib/
    data/                données du site (agences, promotions, biens démo…)
    seo/                  helpers metadata + JSON-LD
    validations/          schémas Zod
    hooks/                 hooks (reveal au scroll, media query…)
  config/                site.ts — coordonnées, réseaux, constantes de marque
```

Toutes les données affichées proviennent de `src/lib/data/*.ts` : aucune
information métier n'est codée en dur dans les composants de page.
