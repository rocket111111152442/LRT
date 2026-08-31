# votrecourtier-redesign

Concept de refonte visuelle et éditoriale, non officiel, de
[votrecourtier.ch](https://votrecourtier.ch/) — agence de courtage
immobilier basée à Crissier (Vaud) et Marly (Fribourg).

**Ceci est une démonstration privée**, pas le site en production. Voir
`docs/votrecourtier-audit.md` (à la racine du dépôt) pour la méthodologie,
les sources et la liste des points à vérifier avant toute diffusion
publique ou mise en ligne réelle. Les biens, agents et avis affichés sur
les pages de démonstration (`tous-nos-biens`, fiches de bien) sont
fictifs et signalés comme tels ; les informations d'entreprise
(coordonnées, prestations, parcours d'Alexandre Mirfassihi) proviennent de
sources publiques vérifiées, listées dans l'audit.

## Stack

- Next.js 16 (App Router, React 19, TypeScript strict)
- Tailwind CSS v4 (tokens centralisés dans `src/app/globals.css`)
- `motion` (Framer Motion) pour les animations éditoriales — utilisé avec
  parcimonie, jamais pour l'esthétique seule
- Aucune base de données : contenu et biens de démonstration dans
  `src/lib/data`

## Développement

```bash
npm install
npm run dev
```

## Structure

- `src/app` — routes (App Router)
- `src/components/ui` — design system (Container, Section, Button, etc.)
- `src/components/home|properties|layout|...` — composants de section
- `src/lib/data` — données de démonstration (biens, localités, témoignages)
- `src/config` — navigation, coordonnées, constantes de marque
