# ALLCX Patrimoine — site vitrine

Site statique autonome de la marque **ALLCX Patrimoine** (transactions sur immeubles et fonds de
commerce). Huit pages, aucun framework, aucune dépendance à installer, aucune étape de compilation
obligatoire : ce sont des fichiers HTML, CSS, JS et SVG que l'on dépose tels quels.

Ce site ne contient rien de l'activité de conseil : ALLCX Consulting fait l'objet d'un site distinct,
conservé dans `sites/allcx-consulting/` et destiné à un autre nom de domaine.

---

## 1. Arborescence

```
sites/allcx-patrimoine/
├── index.html              accueil
├── investissement.html     investissement locatif et fonds de commerce
├── acquisition.html        résidence principale, secondaire, immobilier de prestige
├── relocation.html         mobilité et sportifs de haut niveau
├── biens.html              typologies de biens accompagnés
├── honoraires.html         barème d'honoraires (affichage obligatoire)
├── contact.html            formulaire et coordonnées
├── mentions-legales.html   mentions légales et données personnelles
├── api/contact.js          traitement du formulaire (fonction serverless)
├── contact.php             traitement du formulaire en hébergement PHP
├── vercel.json  .vercelignore  robots.txt  sitemap.xml
├── assets/css  assets/js  assets/img
└── _build/                 générateur facultatif (voir § 6)
```

---

## 2. Mise en ligne

Le site est publié sur **Vercel**, le nom de domaine restant acheté et administré chez **IONOS**.

### Projet Vercel

- **Root Directory** : `sites/allcx-patrimoine`
- **Framework Preset** : Other — aucune commande de build, les fichiers sont servis tels quels
- `vercel.json` fixe les en-têtes de sécurité et la politique de cache
- `.vercelignore` exclut `_build/`, `README.md` et `contact.php` (le PHP ne s'exécute pas sur
  Vercel : servi en statique, il exposerait l'adresse de réception)

### Brancher le domaine

1. Dans le projet Vercel : **Settings → Domains → Add**, saisir le domaine et sa variante `www`.
2. Vercel affiche alors les enregistrements DNS exacts à créer. **Recopier ces valeurs telles
   quelles** : la cible du `CNAME` est propre à chaque projet et ne correspond plus aux valeurs
   génériques que l'on trouve dans les tutoriels.
3. Côté IONOS : **Domaines & SSL → le domaine → DNS**, créer l'enregistrement `A` sur `@` et
   l'enregistrement `CNAME` sur `www` avec les valeurs affichées par Vercel.

Ne **pas** déléguer les serveurs de noms (nameservers) à Vercel : cela déplacerait l'intégralité du
DNS, enregistrements `MX` compris, et interromprait la messagerie. En ne touchant qu'aux
enregistrements `A` et `CNAME`, la messagerie n'est jamais concernée.

Le certificat HTTPS est émis automatiquement une fois la propagation effectuée.

### Choix du nom de domaine

La constante `SITE_URL` en tête de `_build/build.py` vaut aujourd'hui
`https://allcx-consulting.com`. Elle alimente les URL canoniques, le `sitemap.xml` et le
`robots.txt`. **Si le site est publié sur un autre domaine, modifier cette constante et régénérer**
(§ 6), sinon les moteurs de recherche recevront des URL canoniques pointant ailleurs.

Publier une agence de transaction immobilière sur une adresse contenant « consulting » nuit à la
lisibilité de la marque : un domaine propre à ALLCX Patrimoine est préférable.

### Variante : hébergement IONOS classique

Envoyer par FTP **le contenu** de ce dossier (et non le dossier lui-même) dans le répertoire racine,
généralement `/` ou `/htdocs`. Dans ce cas, remettre `action="contact.php"` sur le formulaire
(voir § 3) et ne pas envoyer les dossiers `_build/` ni `api/`.

---

## 3. Formulaire de contact

Le formulaire envoie vers `POST /api/contact`, une fonction serverless sans aucune dépendance
(`api/contact.js`). Elle valide les champs, filtre les robots via un champ piège, puis transmet le
message par l'API HTTP de [Resend](https://resend.com) — le SMTP direct étant généralement bloqué
depuis une fonction serverless.

### Variables d'environnement à définir dans Vercel

*Settings → Environment Variables*, pour les environnements Production et Preview :

| Variable | Rôle |
|---|---|
| `RESEND_API_KEY` | clé d'API Resend |
| `CONTACT_FROM` | expéditeur, sur un domaine vérifié chez Resend (ex. `site@allcx-consulting.com`) |
| `CONTACT_TO` | adresse de réception des demandes |

Créer un compte Resend, y vérifier le domaine (trois enregistrements DNS à ajouter chez IONOS, sans
incidence sur la messagerie existante), puis générer la clé.

### Tant que ce n'est pas configuré

La fonction répond `503` et le formulaire bascule automatiquement sur l'ouverture du logiciel de
messagerie du visiteur, avec la demande préremplie. Rien n'est perdu, mais le parcours est moins
soigné : à configurer avant la mise en avant du site.

### Sans JavaScript

Le formulaire est envoyé de façon classique et la fonction redirige vers la page de contact avec
`?envoi=ok` ou `?envoi=erreur`, message affiché à l'arrivée.

### Sur hébergement PHP

`contact.php` est conservé pour ce cas : vérifier la variable `$destinataire` en tête de fichier,
puis remplacer `action="/api/contact"` par `action="contact.php"` et `data-form="api"` par
`data-form="mailto"` dans `contact.html` — ou modifier la fonction `contact_form` de
`_build/build.py` et régénérer.

---

## 4. À compléter avant la mise en ligne

Toutes les informations manquantes apparaissent sur le site en rouge, soulignées en pointillé, avec
le libellé « à compléter ». On les retrouve toutes d'un coup :

```sh
grep -rn "à compléter" --include="*.html" .
```

**Coordonnées**
- Numéro de téléphone
- Adresse postale du siège
- Adresse de réception : `patrimoine@allcx-consulting.com` est proposée par défaut ; **cette boîte
  doit être créée dans IONOS**, sinon la remplacer par une adresse existante (modifiable en tête de
  `_build/build.py`)

**Mentions légales**
- Capital social, siège social, ville et numéro RCS, numéro de TVA intracommunautaire
- Garantie financière, ou mention de non-détention de fonds, effets ou valeurs
- Assurance de responsabilité civile professionnelle : assureur, n° de contrat, couverture
- Médiateur de la consommation : obligatoire
- Date de dernière mise à jour

**Barème d'honoraires** (`honoraires.html`)
Son affichage complet, en euros toutes taxes comprises, est imposé par l'arrêté du 10 janvier 2017
et fait l'objet de contrôles. Toutes les lignes sont à renseigner.

**Points à valider**
- La page `relocation.html` mentionne nommément le partenariat avec l'AS Saint-Étienne. Vérifier que
  le club autorise cette citation avant publication ; à défaut, remplacer par une formulation
  générique (« un club de football professionnel français »).
- La phrase mise en exergue sur l'accueil est attribuée à Fabrice Ekissi : la faire valider ou la
  remplacer.

**Note légale**
Les mentions légales désignent **ALLCX CONSULTING** comme dénomination sociale de l'éditeur et
responsable de traitement. C'est la raison sociale de la société qui exploite la marque ALLCX
Patrimoine et qui détient la carte professionnelle : cette mention est obligatoire et ne peut pas
être retirée, même si le site ne présente que l'activité immobilière.

---

## 5. Images

Les illustrations d'architecture (`assets/img/*.svg`) ont été dessinées spécifiquement pour ce site :
elles sont libres de droits pour ALLCX et ne posent aucun problème de licence.

Pour les remplacer par de vraies photographies, il suffit de changer l'attribut `src` des balises
`<img>` correspondantes. Recommandations :

- format **WebP** ou **JPEG** de bonne qualité, largeur 1600 px, poids < 250 Ko ;
- rapport **4/3** pour les vignettes de la page « Les biens », libre ailleurs ;
- conserver l'attribut `alt` et l'adapter à la photo réelle ;
- garder `loading="lazy"` sauf pour la première image de la page d'accueil.

Ne publier que des photographies dont ALLCX détient les droits, et ne jamais présenter une
illustration comme un bien réellement disponible — la page « Les biens » le précise explicitement.

---

## 6. Régénérer le site (facultatif)

Les pages HTML sont livrées prêtes à l'emploi et se modifient directement dans un éditeur de texte.
Un générateur est fourni pour les cas où l'on veut modifier le menu, le pied de page, le domaine ou
les coordonnées **en un seul endroit** :

```sh
cd sites/allcx-patrimoine
python3 _build/build.py
```

- `_build/build.py` — domaine, coordonnées, menu, en-tête, pied de page, mentions légales, sitemap
- `_build/content_patrimoine.py` — page d'accueil
- `_build/content_patrimoine_pages.py` — pages intérieures

Le script réécrit les fichiers HTML, `sitemap.xml` et `robots.txt`. Il n'exige que Python 3, sans
aucune bibliothèque externe.

---

## 7. Choix techniques

- **Aucune dépendance externe** en dehors des polices Google Fonts (Cormorant Garamond + Jost).
  Pour supprimer cette dépendance, héberger les fichiers de police dans `assets/` et remplacer le
  `<link>` par une règle `@font-face`.
- **Aucun cookie**, aucun traceur, aucun outil de mesure d'audience : rien à déclarer, pas de
  bandeau de consentement nécessaire en l'état.
- **Accessibilité** : structure sémantique, lien d'évitement, contrastes conformes, navigation au
  clavier, `aria-expanded` sur les composants interactifs, animations désactivées si le système du
  visiteur le demande.
- **Référencement** : titres et descriptions propres à chaque page, URL canoniques, Open Graph,
  données structurées `RealEstateAgent`, `sitemap.xml`, `robots.txt`.
- **Impression** : feuille de style dédiée, utile pour les mentions légales et le barème.

---

## 8. Plan Vercel

Le plan Hobby de Vercel est réservé à un usage non commercial. Un site vitrine exploité pour le
compte d'un client relève du plan Pro. À arbitrer avant la mise en production définitive.

---

## 9. Sécurité

Ne jamais enregistrer d'identifiants (IONOS, messagerie, Resend) dans ce dépôt ni dans un fichier du
site. Les clés se déclarent uniquement dans les variables d'environnement Vercel. Si des
identifiants ont circulé par messagerie, changer le mot de passe concerné et activer la double
authentification.
