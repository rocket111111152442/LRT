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
index.html              Accueil
prestations.html        Détail des prestations
a-propos.html           Le cabinet
contact.html            Coordonnées + formulaire
mentions-legales.html   Mentions légales et protection des données
assets/css/site.css     Design system complet (tokens, composants, responsive)
assets/js/site.js       Interactions (menu, révélations, onglets, relief animé…)
assets/img/             Marque, image Open Graph, icône iOS
vercel.json             cleanUrls, en-têtes de sécurité, cache des assets
```

## Direction artistique

- **Couleurs** — encre `#05070a`, papier `#f4f2ed`, accent menthe `#57e0b4`,
  sable `#e2c489` en appoint. Les jetons sont dans `:root` (`assets/css/site.css`).
- **Typographie** — Archivo (texte) + Instrument Serif en italique pour les
  accents dans les titres, chargées depuis Google Fonts.
- **Motifs** — grain SVG en surimpression, filets à 1 px, sections « papier »
  qui inversent le contraste, crêtes de relief animées en canvas dans la bannière.

Toutes les animations respectent `prefers-reduced-motion`. Sans JavaScript, le
contenu reste entièrement lisible.

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
