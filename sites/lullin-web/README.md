# lullin-web.com — couche d'animations

Le code complet du site lullin-web.com (Vite + React) n'est pas dans ce dépôt :
il est déployé depuis le poste de travail avec le Vercel CLI, sur le projet Vercel
`lullin-web-maquette`. Ce dossier contient seulement les fichiers ajoutés ou modifiés
pour la couche d'animations :

- `src/fx.ts` — nouveau. Grandes apparitions au défilement (titres en rideau
  flouté, cartes de prix et étapes qui basculent en 3D, valeurs et services qui
  arrivent des côtés, pastilles métiers qui s'assemblent depuis tout l'écran, images
  qui se dévoilent, zoom sur le titre de contact et la signature du pied de page),
  textes géants qui défilent en fond, héros qui s'éloigne en se floutant, titres qui
  glissent, déformation selon la vitesse de défilement, onde de choc et éclats au
  clic, compteurs sur les prix. Côté souris, volontairement léger : un petit anneau
  autour du curseur normal, cartes 3D et boutons magnétiques très discrets.
- `src/fx.css` — nouveau. Styles associés.
- `public/images/lullin-logo-spin.svg` — nouveau. Logo vectorisé qui tourne sur
  lui-même dans le héros, à la place de la vidéo du trou noir (la vidéo n'est plus
  téléchargée). Ajouté par `fx.ts`, il reste immobile si les animations sont réduites.
- `src/fx-brand.css` — nouveau. Le nouveau logo partout : remplace les astérisques
  dessinés (après « simplement. » et en fond de la bande contact) et retire la
  mention « Une autre dimension ».
- `public/images/lullin-mark.svg`, `public/favicon.svg`, `public/favicon-48.png`,
  `public/apple-touch-icon.png`, `public/images/favicon-512.png` — remplacés par
  le nouveau logo (en-tête, pied de page, intro, pages, icônes d'onglet et de téléphone).
- `src/fx-tech.ts` + `src/fx-tech.css` — nouveaux. Fond technique : carte
  topographique animée en WebGL2 (courbes de niveau calculées par la carte graphique,
  qui se creusent autour de la souris, grille de points façon plan) et rail de mesures
  en direct sur le bord droit (grands écrans). Arrêtée si l'onglet est masqué, si le
  bouton « Motion » est sur off ou si l'appareil demande moins d'animations.
- `src/main.tsx` — modifié : quatre lignes `import './fx.css'`, `import './fx-brand.css'`,
  `import './fx'` et `import './fx-tech'`.
- `tsconfig.json` — inchangé, copié pour pouvoir vérifier le typage de `fx.ts`.

Pour reporter ces changements dans la copie locale du site, copier `src/fx.ts` et
`src/fx.css`, `src/fx-brand.css`, `src/fx-tech.ts` et `src/fx-tech.css` dans son dossier `src/`, le contenu de `public/`
par-dessus son dossier `public/`, et ajouter les quatre imports dans `src/main.tsx`.
Sinon, le prochain `vercel deploy` fait depuis l'ancienne copie supprimera les animations.

Garde-fous :

- rien ne s'active si l'appareil demande moins d'animations (`prefers-reduced-motion`) ;
- l'interrupteur « Motion on / off » du site (`html[data-motion="off"]`) coupe tous les effets ;
- effets de souris uniquement avec une souris ; amplitudes réduites sur petit écran ;
- seuls des attributs `data-fx-*` et des propriétés CSS individuelles (`translate`,
  `rotate`, `scale`) sont utilisés, pour ne pas entrer en conflit avec Motion ni avec React.
