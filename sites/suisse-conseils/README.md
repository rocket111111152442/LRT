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
--brand      #c8102e   rouge : boutons, accents, liens actifs
--brand-dark #a20d25   survol des boutons
--brand-wash #fdf2f3   fond pâle dérivé du rouge
--ink        #14171c   titres et texte fort
--ink-soft   #55606e   texte secondaire
--paper      #ffffff   fond principal
--paper-alt  #f7f6f4   sections alternées
--line       #e4e2de   filets et bordures
```

Typographie : Manrope (Google Fonts), repli sur les polices système.

## Tenue en performance

Le site doit rester fluide sur une machine modeste :

- aucun canvas, aucun `backdrop-filter`, aucun `mix-blend-mode`,
  aucun filtre `blur`, aucune animation permanente ;
- les transitions ne portent que sur `transform`, `opacity` et `color` ;
- l'`IntersectionObserver` des apparitions se détache dès l'élément affiché ;
- `prefers-reduced-motion` neutralise tout mouvement.

Page d'accueil : ~48 Ko, 5 requêtes, 365 éléments DOM, DOM interactif en 16 ms.

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
