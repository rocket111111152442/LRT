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
assets/css/site.css     Styles (≈250 lignes)
assets/js/site.js       Menu mobile, année, validation du formulaire
assets/img/             Image Open Graph, icône iOS
vercel.json             cleanUrls, en-têtes de sécurité, cache des assets
```

## Parti pris

Sobre et léger, volontairement. Le site doit rester fluide sur une machine
modeste :

- **Couleurs** — blanc, gris très clair `#f5f5f3`, bleu marine `#12395e`.
- **Typographie** — polices système, donc aucune requête externe.
- **Aucune animation permanente** : pas de canvas, pas de `requestAnimationFrame`,
  pas de `backdrop-filter`, pas de `mix-blend-mode`, pas de filtre `blur`,
  pas d'`IntersectionObserver`, pas d'écouteur de souris.

Page d'accueil : ~12 Ko au total, 4 requêtes, 176 éléments DOM.
Le JavaScript (≈60 lignes) ne sert qu'au menu mobile, à l'année du copyright
et à la validation du formulaire. Sans JavaScript, tout reste lisible et
navigable.

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
