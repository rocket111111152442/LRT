# énéo conseil en immobilier — Maquette premium

Refonte moderne et haut de gamme du site vitrine d'énéo conseil en
immobilier SA (Genève), pensée comme une première maquette commerciale.

Stack : **Next.js (App Router) · TypeScript · Tailwind CSS · Framer Motion ·
GSAP / ScrollTrigger · Lenis (smooth scroll)**.

Ce dossier est un projet Next.js **totalement indépendant** du reste du
dépôt (il ne partage ni dépendances, ni configuration, ni routes avec
l'application existante). Toutes les commandes ci-dessous s'exécutent
depuis ce dossier (`eneo-immobilier/`).

## Démarrage

```bash
cd eneo-immobilier
npm install
npm run dev
```

Le site est servi sur [http://localhost:3000](http://localhost:3000).

Autres commandes utiles :

```bash
npm run build   # build de production
npm run start   # sert le build de production
npm run lint    # vérifie le code (ESLint)
```

## Où placer les médias

### Vidéo d'accueil (Runway)

Le hero plein écran attend une vidéo locale ici :

```
public/videos/hero.mp4
```

Elle doit être encodée en H.264/MP4, idéalement **courte (5 à 10 s), en
boucle parfaite (seamless loop), sans son**, et compressée pour le web
(quelques Mo maximum) afin de ne pas pénaliser le temps de chargement.

Prompt Runway recommandé :

> Cinematic premium video for a Swiss real estate advisory company website
> hero, elegant Geneva apartment building entrance, refined architecture
> details, soft natural daylight, slow smooth camera movement, luxury but
> minimal, professional, realistic, no text, no logo, 5 seconds, seamless
> loop.

Tant que `hero.mp4` n'est pas présent, le navigateur affiche simplement
l'image de secours (voir ci-dessous) : le rendu reste propre, sans lien
cassé.

### Image de secours (poster)

```
public/images/hero-poster.jpg
```

Le poster réel (façade d'entrée genevoise) est en place et référencé dans
`src/components/Hero.tsx`. Pour le remplacer par une autre photo, déposez
votre image très haut de gamme au même chemin (format paysage,
≥ 1920×1080).

### Images des services, biens et du projet « La Croisette »

En l'absence de photographies réelles et d'accès réseau à ce stade, ces
sections utilisent des visuels de substitution générés en CSS pur
(`src/components/PlaceholderVisual.tsx` — dégradés sombres, trame façade,
monogramme), dans les mêmes teintes que la charte graphique. C'est un
parti pris volontaire pour une première maquette cohérente et déjà
premium, sans image « cassée » ni photo de banque d'images non qualitative.

Pour les remplacer par de vraies photographies (biens, façades,
intérieurs) :

- Ajoutez vos images dans `public/images/` (ex. `services/gerance.jpg`,
  `biens/villa-cologny.jpg`, `projets/la-croisette.jpg`).
- Remplacez le composant `<PlaceholderVisual ... />` correspondant par un
  composant `next/image` (`<Image src="/images/..." alt="..." fill
  className="object-cover" />`) dans `Services.tsx`, `Properties.tsx` et
  `ProjectShowcase.tsx`.
- Les données (titres, descriptions, prix, surfaces) sont centralisées
  dans `src/lib/data.ts`.

## Structure du projet

```
src/
  app/
    layout.tsx        Layout racine, polices, métadonnées
    page.tsx           Assemblage des sections de la page d'accueil
    globals.css         Styles globaux, réglages Lenis
  components/
    SmoothScroll.tsx    Initialisation Lenis + intégration GSAP ScrollTrigger
    Header.tsx          Header fixe, effet mix-blend-mode
    MobileMenu.tsx       Menu plein écran mobile
    Hero.tsx             Hero vidéo plein écran
    Intro.tsx            Grand texte d'introduction, révélé ligne par ligne
    Services.tsx         Gérance / Courtage / Rénovation
    Properties.tsx       Sélection de biens (ventes / locations)
    ProjectShowcase.tsx  Projet « La Croisette » (section sticky/parallax)
    Team.tsx              Présentation de l'équipe
    Contact.tsx           Coordonnées et appels à l'action
    Footer.tsx             Pied de page
    PlaceholderVisual.tsx  Visuel de substitution (voir ci-dessus)
    Reveal.tsx              Animation d'apparition au scroll (Framer Motion)
  lib/
    data.ts               Contenu éditorial (navigation, services, biens, équipe)
```

## Charte graphique

- **Couleurs** : blanc cassé `#f6f4ef` (ivory), noir profond `#0e0f0d`
  (ink), gris clair `#8c8a83` (stone), vert foncé `#1f2b22` (forest),
  doré discret `#a98c4a` (gold) — voir `tailwind.config.ts`.
- **Typographies** : Fraunces (serif, italique, titres) + Inter (sans,
  texte courant) — chargées via `next/font/google`.
- **Animations** : Lenis pour le smooth scroll global, GSAP ScrollTrigger
  pour les révélations de section, le parallax léger sur les images de
  services et l'effet sticky de la section « La Croisette », Framer Motion
  pour les transitions d'interface (menu, cartes, hero).

## Vérifications effectuées

- Build de production (`npm run build`) sans erreur.
- Rendu contrôlé en desktop (1440×900) et mobile (390×844) via capture
  d'écran automatisée.
- Vérification du plein écran de la vidéo/hero, de l'absence de débordement
  de texte et du bon fonctionnement du menu mobile.

## Prochaines étapes suggérées

- Intégrer la vidéo Runway définitive et les photographies réelles (biens,
  équipe, projet).
- Brancher les boutons « Découvrir le bien » sur de vraies fiches biens.
- Ajouter un formulaire de contact fonctionnel si souhaité.
