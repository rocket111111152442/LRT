# lullin-web.com — couche d'animations

Le code complet du site lullin-web.com (Vite + React) n'est pas dans ce dépôt :
il est déployé depuis le poste de travail avec le Vercel CLI, sur le projet Vercel
`lullin-web-maquette`. Ce dossier contient seulement les fichiers ajoutés ou modifiés
pour la couche d'animations :

- `src/fx.ts` — nouveau. Apparitions au défilement, curseur personnalisé, halo,
  cartes en 3D avec reflet, boutons magnétiques, compteurs sur les prix, éclats au
  clic, parallaxe du héros, bandeau qui se déforme selon la vitesse de défilement.
- `src/fx.css` — nouveau. Styles associés.
- `src/main.tsx` — modifié : deux lignes `import './fx.css'` et `import './fx'`.
- `tsconfig.json` — inchangé, copié pour pouvoir vérifier le typage de `fx.ts`.

Pour reporter ces changements dans la copie locale du site, copier `src/fx.ts` et
`src/fx.css` dans son dossier `src/` et ajouter les deux imports dans `src/main.tsx`.
Sinon, le prochain `vercel deploy` fait depuis l'ancienne copie supprimera les animations.

Garde-fous :

- rien ne s'active si l'appareil demande moins d'animations (`prefers-reduced-motion`) ;
- l'interrupteur « Motion on / off » du site (`html[data-motion="off"]`) coupe tous les effets ;
- curseur, cartes 3D et boutons magnétiques uniquement avec une souris ;
- seuls des attributs `data-fx-*` et des propriétés CSS individuelles (`translate`,
  `rotate`, `scale`) sont utilisés, pour ne pas entrer en conflit avec Motion ni avec React.
