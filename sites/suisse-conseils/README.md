# Suisse-Conseils Management — site vitrine

Site statique : HTML, CSS et JavaScript écrits à la main, sans framework ni
étape de build. On peut l'ouvrir directement dans un navigateur, ou le servir
tel quel.

## Aperçu local

```sh
cd sites/suisse-conseils
python3 -m http.server 8899
# http://127.0.0.1:8899
```

## Structure

```text
build.mjs               Générateur : gabarit commun + contenu de chaque page
index.html              Accueil
frontaliers.html        Espace frontaliers
prevoyance.html         3e pilier et LPP
assurance-maladie.html  LAMal et complémentaires
cabinet.html            Le cabinet
contact.html            Coordonnées + formulaire
mentions-legales.html   Mentions légales et protection des données
assets/css/site.css     Styles — la palette est en tête de fichier
assets/js/site.js       Menu, accordéon, apparitions, formulaire
assets/img/             Image Open Graph, icône iOS
vercel.json             cleanUrls, en-têtes de sécurité, cache des assets
```

Les fichiers `.html` sont générés : modifier `build.mjs` puis lancer
`node build.mjs`. Le site livré reste statique, aucun outil n'est requis
pour le servir.

## Palette

Les huit couleurs du site sont déclarées en tête de `assets/css/site.css`,
dans `:root`. Les remplacer suffit à rehabiller l'ensemble :

```css
--brand       #b41f24   rouge du logo : boutons, accents
--brand-dark  #8b1418   rouge profond du galet, survols
--brand-light #c2222a   rouge clair du dégradé
--brand-wash  #fbf2f2   fond pâle dérivé du rouge
--silver      #c9c9c9   argent du reflet du logo
--ink         #1a1c1f   titres et texte fort
--ink-soft    #5a6068   texte secondaire
--paper       #ffffff   fond principal
--paper-alt   #f6f5f3   sections alternées
--line        #e6e4e0   filets et bordures
```

Typographie : Archivo (Google Fonts), dont l'italique gras fait écho au
lettrage du logo. Repli sur les polices système.

## Logo

`assets/img/logo.svg` et sa variante pour fond sombre `logo-blanc.svg` sont
une reconstitution vectorielle du logo fourni. Le lettrage y est du texte
composé en Archivo : le SVG est donc **inséré dans la page** plutôt
qu'appelé via `<img>`, car une image SVG externe n'hérite pas des polices du
document.

Pour poser le fichier original à la place : remplacer `assets/img/logo.svg`
(et la variante claire), puis relancer `node build.mjs`. Si le fichier
original contient déjà son lettrage vectorisé, un simple
`<img src="/assets/img/logo.svg" alt="…">` suffit dans `build.mjs`.

## Tenue en performance

Le site doit rester fluide sur une machine modeste :

- aucun canvas, aucun `backdrop-filter`, aucun `mix-blend-mode`,
  aucun filtre `blur`, aucune animation permanente ;
- les transitions ne portent que sur `transform`, `opacity` et `color` ;
- l'`IntersectionObserver` des apparitions se détache dès l'élément affiché ;
- `prefers-reduced-motion` neutralise tout mouvement.

Page d'accueil : 5 requêtes, 419 éléments DOM, DOM interactif en 15 ms.

## Formulaire de contact

Il n'y a pas de backend : le formulaire valide les champs puis compose un
`mailto:` vers l'adresse définie par l'attribut `data-to` du `<form>`.
Pour passer à un envoi côté serveur, remplacer le gestionnaire `submit` dans
`assets/js/site.js` par un `fetch` vers une route d'API.

## Textes

Les textes actuels sont **provisoires**. Le site d'origine
(`suisse-conseilsm.ch`) n'était pas joignable depuis l'environnement de
développement, l'accès sortant étant filtré par le proxy réseau. Les
coordonnées, en revanche, sont celles du cabinet :

- Route de Saint-Julien 129, 1228 Plan-les-Ouates, Genève
- +41 76 206 05 91 — contact@suisse-conseilsm.ch

À compléter avant mise en ligne définitive : raison sociale exacte, forme
juridique, numéro IDE et numéro d'inscription au registre FINMA
(voir `mentions-legales.html`).

## Déploiement

Projet Vercel `suisse-conseils`, lié à ce dépôt avec
`sites/suisse-conseils` comme répertoire racine. Chaque push déclenche un
déploiement : les branches donnent une préproduction, `main` la production.
