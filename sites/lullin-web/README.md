# Lullin Web — « Le Zootrope »

Portfolio immersif de Lullin Web. C'est une adaptation de la vidéo de référence (reel Instagram de @designedby.russ, « POV: Client needed an interactive portfolio », qui montre le site « The Zoetrope » de Parallel Studios), avec les vraies réalisations de Lullin Web.

Projet indépendant : il est exclu du `tsconfig.json` racine et ne touche pas au build de Qoravo.

```bash
cd sites/lullin-web
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint && npm run typecheck
```

Stack : Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Three.js (scène codée à la main, sans React Three Fiber) · GSAP (animations, boucle de rendu) · Lenis (défilement fluide).

## 1. Analyse de la référence

La vidéo dure 25,7 s, au format 720×1280. Le site y est filmé sur un écran au téléphone. Le ciel d'aurore en haut de l'image et le décor rouge du début (0–2,5 s) appartiennent à la pièce, pas au site.

| Temps | Scène observée | Implémentation |
|---|---|---|
| 2,5–4 s | **Ouverture** : vue plongeante dans un cylindre tapissé d'écrans de sites, anneaux concentriques jusqu'à un disque bleu lumineux (le sol) où se tient une minuscule silhouette. On voit le titre serif « The Zoetrope », un petit sur-titre, une ligne courte, puis deux liens « Enter with sound » / « Enter quietly ». En haut à gauche : nom du studio. En haut à droite : « Index » et « Sound off ». | `Zoetrope.ts` (`cameraAt`, `buildWall`), calque `hud-hero` |
| 4–6 s | **Descente** : la caméra plonge le long de l'axe et les anneaux défilent en tournant. Phrase 1 à gauche, « Every screen is a real site. », plus un paragraphe. En bas à gauche, le nom du site visible à l'écran. | `STATEMENT_WINDOWS[0]`, `hud-now` |
| 6–7,5 s | Phrase 2 à droite, « Scroll, and they scroll with you. ». Le sol grossit, la silhouette est vue du dessus avec une ombre portée. | Fenêtre glissante dans chaque capture, liée au défilement (`panelFragment`) |
| 7,5–9,5 s | Phrase 3, « Take one off the wall. ». La caméra se redresse à hauteur d'œil, derrière le personnage debout sur le sol bleu, face au mur incurvé. | Bascule de tangage de -90° à environ 0 |
| 9,5–10,5 s | Un écran **se décroche du mur** et vient se placer au-dessus du personnage, avec un éclat lumineux et une bordure colorée. | `flyIn()` |
| 10,5–18 s | **Projets** (neuf, compteur « 01 / 09 ») : grand titre serif en bas à gauche, sous-titre, citation en italique, deux liens. À droite, la liste des projets avec un trait sur le projet actif. Les projets s'enchaînent par une **transition en lamelles verticales** dans l'écran. Le mur tourne, et le liseré du personnage prend la couleur du projet. | `swapTo()`, `featureFragment`, `hud-project`, `hud-index`, `SplitTitle` |
| 18–20 s | **Remontée** : la caméra rebascule vers le bas et remonte hors du puits. | Segment `outro` de `cameraAt` |
| 20–25 s | **Final** : petit puits centré sur fond bordeaux, titre « Your site, next on the wall. », une phrase, « Start a project → » et une mention légale en pied de page. | `hud-outro`, variable CSS `--outro` |

Points incertains :
- **Le flou de mouvement.** Les images sont floues pendant les mouvements rapides. On ne peut pas savoir si ce flou vient du site ou de la caméra qui filme l'écran. Il n'a pas été reproduit.
- **Ce que joue chaque écran.** Les écrans semblent montrer des enregistrements vidéo des sites. Ici, ce sont des captures pleine page qui défilent.
- **Les polices exactes.** Elles ne sont pas identifiables avec certitude. Le style ressemble à une Didone à fort contraste avec une linéale. Choix retenus : Playfair Display et Inter.
- **La rotation des anneaux.** On ne sait pas si chaque rangée tourne indépendamment.
- **Le son.** Il n'est pas audible dans la vidéo.

## 2. Ce qui n'est pas identique (sans les fichiers d'origine)

- **Personnage** : la référence utilise un modèle 3D riggé et animé. Ici, la silhouette est procédurale (`figure.ts`) : contre-jour, liseré coloré, marche liée à la vitesse de défilement, coups d'œil.
- **Écrans** : ce sont des captures pleine page qui défilent, pas des vidéos. Il est possible de passer à des vidéos (WebM/MP4 en `VideoTexture`), au prix d'un poids bien plus élevé.
- **Son** : la nappe d'ambiance et les souffles sont générés en direct (Web Audio, `lib/audio.ts`). Aucun fichier audio n'est utilisé.

## 3. Contenus

- `src/content/projects.ts` : les 23 réalisations relevées sur lullin-web.com/realisations le 23/11/2026, avec le H1 réel de chaque site. Le lien **votrecourtier.ch** (`votrecourtier-redesign.vercel.app`) renvoyait une page 404 : il a été exclu et doit être corrigé sur le site actuel.
- `src/content/site.ts` : textes, services et contact.

**À valider (PROVISOIRE)** : le site actuel ne publie ni téléphone, ni adresse, ni réseaux sociaux, ni chiffres clés. Aucun n'a été inventé. Les services « SEA » et « Automatisation & IA » viennent du brief et ne figurent pas sur lullin-web.com. Le formulaire de contact ouvre la messagerie du visiteur (`mailto:`), car aucun envoi côté serveur n'est configuré.

## 4. Mettre à jour les écrans

```bash
npm i -D playwright            # si absent
node scripts/capture-screens.mjs
python3 scripts/build-textures.py   # nécessite Pillow
```

Les textures sont générées en quatre tailles : `wall` 384 px, `wall-sm` 256 px pour le mobile, `feature` 1024 px et `feature-sm` 768 px pour le mobile.

## 5. Performance et accessibilité

- Mode économe, activé sur écran tactile, sur largeur inférieure à 820 px ou avec 4 cœurs ou moins : textures réduites, 15 rangées au lieu de 20, moins de particules, pas d'antialiasing, DPR limité à 1,5, cache d'au plus 3 écrans décrochés.
- Le mur est fait d'une `InstancedMesh` par site, soit environ 25 draw calls pour 280 écrans.
- Les textures sont chargées progressivement, avec un fondu à leur arrivée. Les écrans décrochés sont chargés à la demande, le projet suivant étant préchargé.
- `prefers-reduced-motion` : pas de défilement fluide ; la caméra passe d'une station à l'autre sans vol, sans parallaxe ni dérive ; les transitions sont réduites.
- Navigation : un lien d'évitement ; des fenêtres `<dialog>` natives (piège du focus, touche Échap) ; les flèches ← → passent d'un projet à l'autre ; les textes sont lisibles par les lecteurs d'écran et indexables (H1, liste des projets, services, JSON-LD `ProfessionalService`).
- Sécurité : en-têtes CSP stricts (`next.config.ts`). Aucune ressource tierce n'est chargée à l'exécution : les polices sont auto-hébergées par `next/font`.

Pas de déploiement automatique. Pour Vercel, créer un projet distinct avec `sites/lullin-web` comme dossier racine.
