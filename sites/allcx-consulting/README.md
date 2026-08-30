# ALLCX Consulting — site vitrine (en attente de publication)

Site statique autonome de la marque **ALLCX Consulting** (conseil en management et développement
commercial, formation, apport d'affaires). Sept pages, aucun framework, aucune dépendance.

**Ce site n'est déployé nulle part pour le moment.** Il est conservé ici en vue d'une publication
ultérieure, sur un nom de domaine distinct de celui d'ALLCX Patrimoine. Les deux marques sont
volontairement séparées : aucun lien ne relie ce site à celui d'ALLCX Patrimoine.

## Contenu

```
index.html              accueil
expertises.html         conseil, formation, apport d'affaires
afrique.html            implantation en Afrique francophone
formation.html          programmes et modalités
cabinet.html            le cabinet et sa direction
contact.html            formulaire et coordonnées
mentions-legales.html   mentions légales et données personnelles
```

## Avant de le publier

1. **Choisir le domaine** et renseigner `SITE_URL` en tête de `_build/build.py`, puis régénérer :
   `python3 _build/build.py`. Cette constante alimente les URL canoniques, le `sitemap.xml` et le
   `robots.txt` : un domaine erroné fausse le référencement.
2. **Créer un projet Vercel distinct**, avec `sites/allcx-consulting` comme *Root Directory* et
   « Other » comme framework. Ne pas réutiliser le projet d'ALLCX Patrimoine.
3. **Compléter les informations manquantes** — elles apparaissent en rouge sur le site :
   `grep -rn "à compléter" --include="*.html" .`
   Téléphone, adresse du siège, capital social, RCS, TVA, numéro de déclaration d'activité de
   prestataire de formation, certification Qualiopi le cas échéant, parcours du dirigeant,
   médiateur de la consommation.
4. **Configurer le formulaire** : variables `RESEND_API_KEY`, `CONTACT_FROM` et `CONTACT_TO` dans
   les variables d'environnement Vercel. Sans elles, le formulaire bascule sur l'ouverture du
   logiciel de messagerie du visiteur.
5. **Valider la phrase mise en exergue** sur la page d'accueil, attribuée à Fabrice Ekissi.

Le fonctionnement technique (hébergement, DNS, formulaire, régénération) est identique à celui
décrit dans `sites/allcx-patrimoine/README.md`, auquel on peut se reporter.

## Illustrations

Ce site n'utilise pas d'illustration : les dessins d'architecture appartiennent à l'univers
Patrimoine et se trouvent dans `sites/allcx-patrimoine/assets/img/`. Prévoir, au moment de la
publication, des visuels propres à l'activité de conseil.
