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
- `api/google-reviews.ts` — nouveau. Fonction serveur qui lit la note, le nombre
  d'avis et les derniers avis Google via l'API Google Places (New). Clé dans la
  variable Vercel `GOOGLE_PLACES_API_KEY` ; fiche trouvée par `GOOGLE_PLACE_ID` si
  défini, sinon par recherche « Lullin Web ». Réponse en cache 12 h sur le CDN.
- `src/fx-reviews.ts` + `src/fx-reviews.css` — nouveaux. Section « Avis Google »
  insérée juste avant la FAQ ; rien n'est affiché si l'API ne répond pas.
- Simulateur de prix `/simulateur-prix-site-internet` (pas encore déployé) :
  - `public/simulateur/tarifs.js` — nouveau. Les tarifs de la page Offres (formules,
    pages supplémentaires, options, maintenance). **Si un prix change dans
    `src/content.ts`, le changer aussi ici.**
  - `public/simulateur/simulateur.js` + `simulateur.css` — nouveaux. Calcul en direct,
    résumé, barre d'estimation sur mobile, bouton « Recevoir mon devis personnalisé »
    vers `/contact?offre=…&type=…&maintenance=…`, événements anonymes dans
    `window.dataLayer` (`simulator_view`, `simulator_change`, `simulator_suggestion_click`,
    `simulator_cta_click`).
  - `scripts/build-simulator.mjs` — nouveau, lancé à la fin de `npm run build`. Génère
    la page statique (en-tête, pied de page et CSS repris de `dist/blog/index.html`,
    métadonnées, JSON-LD WebPage + BreadcrumbList + FAQPage), l'ajoute à
    `dist/sitemap.xml` et place un encart vers le simulateur dans l'article
    « Combien coûte un site internet ».
  - `src/fx-simulator.ts` + `src/fx-simulator.css` — nouveaux. Sur `/contact`, coche les
    options et préremplit la description à partir des choix du simulateur ; encarts vers le
    simulateur sur `/offres` et `/services` ; boutons d'accès (lien « Simulateur de prix »
    dans la barre de navigation et le pied de page, carte en tête du menu mobile, bouton
    « Estimer gratuitement mon site » sur l'accueil, bouton flottant sur mobile) ;
    événement `generate_lead` quand une demande de devis est envoyée.
  - `public/analytics/consent.js` + `src/fx-consent.css` — nouveaux. Google Analytics 4
    chargé seulement après accord du visiteur (bandeau Accepter / Refuser, lien « Gestion
    des cookies » en bas de page). **Inactif tant que la variable Vercel
    `GA_MEASUREMENT_ID` (G-XXXXXXXXXX) n'est pas définie** ; avant de l'activer, mettre à
    jour la page Confidentialité (`src/legal.tsx`), qui dit aujourd'hui qu'aucun cookie de
    mesure n'est utilisé.
  - `vercel.json` — une réécriture ajoutée pour `/simulateur-prix-site-internet`.
  - `package.json` — `&& node scripts/build-simulator.mjs` ajouté au script `build`.
- `src/main.tsx` — modifié : lignes `import './fx.css'`, `import './fx-brand.css'`,
  `import './fx'`, `import './fx-tech'`, `import './fx-reviews'` et
  `import './fx-simulator'` (en plus de `import './communication.css'` ajouté de ton côté).
- `tsconfig.json` — inchangé, copié pour pouvoir vérifier le typage de `fx.ts`.

Pour reporter ces changements dans la copie locale du site, copier `src/fx.ts` et
`src/fx.css`, `src/fx-brand.css`, `src/fx-tech.ts`, `src/fx-tech.css`, `src/fx-reviews.ts`
et `src/fx-reviews.css` dans son dossier `src/`, `api/google-reviews.ts` dans `api/`, le contenu de `public/`
par-dessus son dossier `public/`, et reprendre `src/main.tsx`. Pour le simulateur, copier
aussi `src/fx-simulator.ts`, `src/fx-simulator.css`, `src/fx-consent.css`,
`scripts/build-simulator.mjs`, `vercel.json` et `package.json`.
Sinon, le prochain `vercel deploy` fait depuis l'ancienne copie supprimera les animations.

Garde-fous :

- rien ne s'active si l'appareil demande moins d'animations (`prefers-reduced-motion`) ;
- l'interrupteur « Motion on / off » du site (`html[data-motion="off"]`) coupe tous les effets ;
- effets de souris uniquement avec une souris ; amplitudes réduites sur petit écran ;
- seuls des attributs `data-fx-*` et des propriétés CSS individuelles (`translate`,
  `rotate`, `scale`) sont utilisés, pour ne pas entrer en conflit avec Motion ni avec React.
