# Agence ADIMEN — site

Refonte complète du site de l'**Agence ADIMEN**, détectives privés agréés par le
Conseil d'État à Genève. Application **Next.js** autonome, vivant dans son propre
dossier du dépôt, à l'image des autres sites de `sites/`.

> **À lire en premier :** [`CONTENU-A-VALIDER.md`](./CONTENU-A-VALIDER.md) recense
> les informations qui demandent une validation humaine avant publication, et
> [`../../docs/adimen-audit.md`](../../docs/adimen-audit.md) l'audit du site
> précédent dont découle l'arborescence.

---

## 1. Démarrer

```sh
cd sites/adimen
npm install
npm run dev          # http://localhost:3000
```

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Construction de production |
| `npm start` | Sert la construction de production |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, sans émission |

---

## 2. Pile technique

| Brique | Version | Rôle |
|---|---|---|
| Next.js | 16, App Router | Rendu statique de toutes les pages |
| TypeScript | 6, mode strict | `noUncheckedIndexedAccess` compris |
| Tailwind CSS | 4 | Jetons du design system dans `@theme` |
| GSAP + ScrollTrigger | 3 | Parallaxe et tracé au défilement, chargés à la demande |
| React Three Fiber + three.js | 9 / 0.181 | Les trois scènes 3D, chargées à la demande |
| lucide-react | 1 | Icônes |

Aucune bibliothèque ne fait double emploi : une seule solution d'animation au
défilement, une seule de 3D, un seul jeu d'icônes.

---

## 3. Arborescence

```
src/
├── app/
│   ├── layout.tsx                    en-tête, pied de page, JSON-LD global
│   ├── page.tsx                      accueil
│   ├── globals.css                   jetons du design system + couches base/components
│   ├── ui.css                        composants (boutons, cartes, formulaires)
│   ├── opengraph-image.tsx           image de partage, générée à la construction
│   ├── sitemap.ts  robots.ts  icon.svg  not-found.tsx
│   ├── api/contact/route.ts          traitement du formulaire
│   ├── agence/  garanties/  tarifs/  medias/  emplois/  contact/
│   ├── services/{particuliers,entreprises,parents,contre-mesures}/
│   ├── detective-geneve/  detective-lausanne/  reseau-international/
│   └── mentions-legales/  politique-de-confidentialite/  gestion-des-cookies/
├── components/                       en-tête, pied de page, formulaire, trames de page
│   └── scenes/                       SceneHote + les trois scènes WebGL
├── content/                          ← tout le contenu éditorial et factuel
│   ├── site.ts                       coordonnées, horaires, tarifs, agréments
│   ├── services.ts                   prestations, garanties, processus
│   ├── navigation.ts  villes.ts  medias.ts
└── lib/                              seo, jsonld, formulaire, motion, geo, aleatoire
```

### Où modifier quoi

| Pour changer… | Ouvrir |
|---|---|
| Une adresse, un téléphone, un horaire, la fourchette de tarifs | `src/content/site.ts` |
| Une prestation, une garantie, une étape du processus | `src/content/services.ts` |
| Le menu ou le pied de page | `src/content/navigation.ts` |
| Le contenu des pages Genève / Lausanne | `src/content/villes.ts` |
| Les interventions dans les médias | `src/content/medias.ts` |
| Une couleur, une graisse, un espacement | `src/app/globals.css`, bloc `@theme` |
| Une redirection d'ancienne URL | `next.config.ts`, tableau `anciennesUrl` |

**Aucune donnée factuelle n'est écrite en dur dans un composant.** Corriger une
coordonnée dans `site.ts` la corrige partout : pages, pied de page, données
structurées et plan du site.

---

## 4. Design system

Les jetons sont déclarés dans `@theme` (`src/app/globals.css`) et disponibles
comme utilitaires Tailwind.

**Couleurs** — `noir` `graphite` `ardoise` `acier` `acier-clair` (fonds et
traits), `brume` `argent` `ivoire` (textes), `champagne` `champagne-clair`
`champagne-sombre` (accent), `tactique` (vert très discret, réservé à la
confirmation), `alerte` (erreurs de formulaire).

**Typographie** — Newsreader pour les titres (éditorial), Inter pour le texte
courant, JetBrains Mono pour les surtitres et les nombres. Les trois familles
sont **auto-hébergées** par `next/font` : aucune requête vers un tiers depuis le
navigateur du visiteur, donc aucun traceur de police et rien à déclarer côté
cookies.

**Échelle** — `etiquette` `menu` `corps` `conduite` `t4` `t3` `t2` `t1` `affiche`,
toutes fluides entre 375 px et 1600 px.

Sont également des jetons : espacements, rayons (`fin`…`ample`), profondeurs
(`niveau-1`…`niveau-4`, `lueur`), durées (`eclair`…`scene`) et courbes
(`net` `doux` `appui`).

### Une règle à ne pas oublier

`ui.css` est encapsulé dans `@layer components`, et la réinitialisation de
`globals.css` dans `@layer base`. **C'est indispensable :** une règle écrite hors
couche l'emporte sur *toutes* les couches, utilitaires compris. Un simple
`h1 { margin: 0 }` non rangé neutraliserait silencieusement chaque `mt-*` posé
sur un titre. Toute règle ajoutée doit donc rejoindre une couche.

---

## 5. Animations et 3D

### Trois scènes WebGL

| Scène | Où | Ce qu'elle représente |
|---|---|---|
| `SceneLemanique` | Accueil | L'arc lémanique en nappe de points. **Le lac n'est pas dessiné : il est creusé** — les points situés dans l'eau sont retirés et la silhouette du Léman apparaît en négatif. Les quatre implantations sont posées à leurs coordonnées réelles, reliées par des arcs parcourus d'impulsions. |
| `SceneGlobe` | Réseau international | Globe sombre en répartition de Fibonacci, liaisons depuis Genève vers les zones d'intervention annoncées. |
| `SceneBalayage` | Contre-mesures | Un front lumineux traverse un volume de points et éclaire ce qu'il rencontre ; quelques points continuent de pulser après son passage. Abstrait — ni radar, ni interface d'instrument. |

La projection géographique corrige le rapport longitude/latitude (à 46° de
latitude, un degré de longitude vaut ~77,5 km contre 111 km pour un degré de
latitude) : l'arc lémanique n'est donc pas étiré. Voir `src/lib/geo.ts`.

Les scènes utilisent un **générateur pseudo-aléatoire à graine fixe**
(`src/lib/aleatoire.ts`) plutôt que `Math.random()` : la construction reste une
fonction pure, et la figure est identique à chaque chargement.

### Garde-fous

`SceneHote` (`src/components/scenes/SceneHote.tsx`) applique trois règles :

1. la scène n'est **importée** qu'à l'approche de la fenêtre (300 px de marge) ;
2. sans WebGL ou en mouvement réduit, **three.js n'est jamais téléchargé** — seul
   le repli est rendu ;
3. le repli reste dans le DOM sous la scène : aucun vide pendant le chargement,
   et un contenu subsiste si le contexte WebGL est perdu.

Le repli de la scène d'accueil est la **carte SVG des implantations**, construite
à partir des mêmes données géographiques : ce n'est pas une image de
remplacement, c'est le même contenu sous une autre forme.

Trois niveaux de qualité sont décidés par `useCapaciteGraphique` : `complete`,
`allegee` (petit écran, moins de quatre cœurs, ou mode économie de données) et
`aucune` (pas de WebGL, ou mouvement réduit).

### Mouvement réduit

`prefers-reduced-motion: reduce` neutralise l'ensemble : révélations au
défilement, masques de titre, parallaxe, ouverture du site et scènes 3D.
**Aucune information n'est portée par la seule animation** — les états finaux
sont ceux du rendu statique.

L'ouverture du site est décrite entièrement en CSS : elle se joue donc aussi sans
JavaScript, et le voile n'intercepte aucun clic.

---

## 6. Formulaire de contact

Champs : nom, e-mail, téléphone (facultatif), moyen de contact préféré, nature de
la demande, ville ou secteur, disponibilités, message, consentement.

- **Validation partagée** — `src/lib/formulaire.ts` est utilisé par le composant
  *et* par la route d'API : les règles ne peuvent pas diverger. La validation
  serveur reste la seule qui fasse foi.
- **Accessibilité** — chaque champ porte son `<label>`, `aria-invalid` et
  `aria-describedby` ; le résumé d'erreur est annoncé en `aria-live` et le focus
  est porté sur le premier champ fautif.
- **Anti-spam** — champ piège hors du parcours au clavier et des lecteurs
  d'écran, plus une limitation à 5 envois par 10 minutes et par adresse.
- **Sécurité** — vérification de l'origine, retours à la ligne neutralisés dans
  les en-têtes, échappement HTML du corps du message, et aucun détail du
  prestataire renvoyé au visiteur en cas d'échec.
- **Repli** — si l'envoi automatique n'est pas configuré ou échoue, le formulaire
  propose d'ouvrir la demande préremplie dans le logiciel de messagerie du
  visiteur. **La confirmation n'est affichée que sur un succès réel.**

Configuration : voir `.env.example` et `CONTENU-A-VALIDER.md § 5.1`.

---

## 7. Référencement

- Titre et description **uniques** sur chacune des 17 pages, un seul `<h1>`.
- URL canoniques, Open Graph, Twitter Card, image de partage générée à la
  construction.
- `sitemap.xml` et `robots.txt` produits par l'application.
- Fil d'Ariane visible **et** balisé `BreadcrumbList`, les deux issus de la même
  source : ils ne peuvent pas diverger.
- JSON-LD : `ProfessionalService`, `WebSite`, `LocalBusiness` (une fiche par
  bureau), `Service`, `BreadcrumbList`, et `FAQPage` **uniquement sur `/tarifs/`**,
  où les questions sont réellement visibles.
- **Aucune note ni avis** dans les données structurées : les publier sans avis
  réels constituerait un balisage trompeur.
- Référencement local : pages dédiées Genève et Lausanne, secteurs couverts,
  coordonnées géographiques, horaires.

### Continuité avec l'ancien site

`trailingSlash` est activé pour conserver la forme des URL du site précédent, et
**22 redirections 301** couvrent l'inventaire de l'audit — y compris l'ancienne
URL fautive `/resau-international-detective/` et les pages `/en/` non reconduites.
Chaque redirection atteint sa cible **en une seule étape**.

---

## 8. Accessibilité

Cible : **WCAG 2.2 niveau AA**.

- Navigation complète au clavier, lien d'évitement, focus visible homogène.
- Menu mobile en `role="dialog"` avec `aria-modal`, `inert` quand il est fermé,
  fermeture par `Échap` et défilement de la page bloqué à l'ouverture.
- Structure sémantique : un seul `h1`, hiérarchie continue, `<nav>` étiquetés,
  `<address>` pour les coordonnées.
- Cibles tactiles d'au moins 44 px.
- Contrastes : `ivoire`, `argent` et `brume` sur les fonds sombres dépassent 4,5:1.
- Les scènes 3D sont `aria-hidden` : elles sont décoratives, et leur contenu
  existe dans le DOM.

---

## 9. Mise en ligne

Le site est un projet Next.js autonome dans un dépôt qui en contient d'autres.

- **Root Directory** : `sites/adimen`
- **Framework** : Next.js — détecté automatiquement
- Variables d'environnement : voir `.env.example`

`next.config.ts` ancre `turbopack.root` sur ce dossier. **Sans cette ancre**,
l'outil remonte jusqu'au dépôt parent — qui contient d'autres `package-lock.json`
— et tente d'y résoudre les modules d'une autre application.

En-têtes de sécurité posés par `next.config.ts` : `X-Content-Type-Options`,
`Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`,
`Strict-Transport-Security`, `Cross-Origin-Opener-Policy`.

---

## 10. Vérifications effectuées

| Contrôle | Résultat |
|---|---|
| `npm run lint` | 0 erreur, 0 avertissement |
| `npm run typecheck` | 0 erreur (mode strict) |
| `npm run build` | 17 pages + `sitemap.xml`, `robots.txt`, image de partage |
| Pages testées au navigateur | 18 (17 + la page 404) |
| Largeurs testées | 375, 768, 1024, 1440, 1920 px |
| Débordement horizontal | aucun, à toutes les largeurs |
| Erreurs de console | aucune |
| Liens internes morts | aucun |
| Redirections 301 | 22, vérifiées une à une, une seule étape |
| Structure | 1 `<h1>` par page, titres et descriptions uniques |
| Mouvement réduit | aucune animation résiduelle, aucun canevas WebGL |
| Menu mobile | ouverture, navigation, fermeture par `Échap` |
| Formulaire | validation client, réponse serveur, repli messagerie |
