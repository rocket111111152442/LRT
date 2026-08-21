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
assets/img/             Logo, image Open Graph, icône iOS
parcours.mjs            Questions du devis, une branche par assurance
illustrations.mjs       Illustrations SVG dessinées aux couleurs du cabinet
api/lead.js             Réception des demandes et envoi au cabinet
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

`assets/img/logo.png` est le logo officiel du cabinet : le fichier fourni
(`assets/img/images.jpg`) a été détouré, recadré et ré-encodé en PNG. Il est
posé sur blanc — d'où la plaque blanche qui l'accueille dans le pied de page
sombre (`.brand--plaque`).

Pour le remplacer : déposer le nouveau fichier sous `assets/img/logo.png`
puis relancer `node build.mjs`. Le générateur recalcule l'empreinte du
fichier et met à jour le `?v=…` de toutes les pages, ce qui vide le cache
des navigateurs. Si les proportions changent, ajuster `width`/`height` dans
la fonction `marque()` de `build.mjs`.

## Tenue en performance

Le site doit rester fluide sur une machine modeste :

- aucun canvas, aucun `backdrop-filter`, aucun `mix-blend-mode`,
  aucun filtre `blur`, aucune animation permanente ;
- les transitions ne portent que sur `transform`, `opacity` et `color` ;
- l'`IntersectionObserver` des apparitions se détache dès l'élément affiché ;
- `prefers-reduced-motion` neutralise tout mouvement.

Page d'accueil : 5 requêtes, 419 éléments DOM, DOM interactif en 15 ms.

## Où arrivent les demandes

Les trois formulaires du site (devis guidé, demande de contact, formulaire
de la page contact) envoient les réponses en JSON à `/api/lead`, une
fonction sans serveur Vercel (`api/lead.js`). Celle-ci compose un courriel
lisible — une ligne par question posée — et l'expédie à l'adresse du
cabinet. La réponse du visiteur est mise en `reply-to` : il suffit de
répondre au message pour lui écrire.

### Configuration (variables d'environnement Vercel)

| Variable | Rôle |
| --- | --- |
| `RESEND_API_KEY` | clé [Resend](https://resend.com) — 100 mails/jour gratuits |
| `BREVO_API_KEY` | clé [Brevo](https://brevo.com) — 300 mails/jour gratuits, alternative à Resend |
| `LEAD_TO` | destinataire (défaut : `contacts@suisse-conseilsm.ch`) |
| `LEAD_FROM` | expéditeur, à vérifier chez le fournisseur (défaut : `onboarding@resend.dev`) |

Une seule des deux clés suffit : `RESEND_API_KEY` est essayée en premier.
À poser dans *Project → Settings → Environment Variables*, puis redéployer.

**Tant qu'aucune clé n'est configurée**, la fonction répond `501` et le site
bascule automatiquement sur l'ouverture de la messagerie du visiteur
(`mailto:` vers l'adresse de `data-to`) : aucune demande n'est perdue, mais
elle dépend alors du logiciel de courrier du visiteur. Configurer une clé
est donc la première chose à faire avant la mise en ligne.

### Garde-fous

- champ leurre `site_web`, invisible et hors tabulation : rempli, la demande
  est ignorée en silence ;
- une demande par adresse IP et par minute ;
- nom et adresse e-mail vérifiés côté serveur ;
- aucune base de données : rien n'est stocké, tout part par courriel.

Pour brancher un CRM à la place (ou en plus) du courriel, ajouter l'appel
dans `api/lead.js` : le corps reçu contient `assurance`, `nom`, `email`,
`telephone` et le tableau `reponses` (`{question, reponse, nom}`).

## Textes

Les textes actuels sont **provisoires**. Le site d'origine
(`suisse-conseilsm.ch`) n'était pas joignable depuis l'environnement de
développement, l'accès sortant étant filtré par le proxy réseau. Les
coordonnées, en revanche, sont celles du cabinet :

- Avenue Rosemont 12, 1208 Genève
- +41 22 518 55 46 — contacts@suisse-conseilsm.ch

À compléter avant mise en ligne définitive : raison sociale exacte, forme
juridique, numéro IDE et numéro d'inscription au registre FINMA
(voir `mentions-legales.html`).

## Déploiement

Projet Vercel `suisse-conseils`, lié à ce dépôt avec
`sites/suisse-conseils` comme répertoire racine. Chaque push déclenche un
déploiement : les branches donnent une préproduction, `main` la production.
