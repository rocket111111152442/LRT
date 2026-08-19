# Site ALLCX — Consulting & Patrimoine

Site vitrine statique en deux univers indépendants, servis depuis un seul hébergement :

| Univers | Dossier | Sujet |
|---|---|---|
| Portail d'accueil | `index.html` | Choix entre les deux marques |
| **ALLCX Consulting** | `consulting/` | Conseil, formation, apport d'affaires |
| **ALLCX Patrimoine** | `patrimoine/` | Transactions sur immeubles et fonds de commerce |

Les deux univers ne se croisent nulle part : navigation, pied de page, coordonnées, mentions
légales et identité visuelle sont propres à chacun. Le seul point de jonction est le portail
d'accueil, accessible par un lien discret en pied de page.

Aucun framework, aucune dépendance à installer, aucune étape de compilation obligatoire :
ce sont des fichiers HTML, CSS, JS et SVG que l'on dépose tels quels sur un hébergement.

---

## 1. Arborescence

```
sites/allcx/
├── index.html                 portail (choix des deux univers)
├── vercel.json  .vercelignore  robots.txt  sitemap.xml
├── api/contact.js             traitement du formulaire (fonction serverless)
├── assets/
│   ├── css/allcx.css          feuille de styles unique (deux thèmes)
│   ├── js/allcx.js            menu, apparitions, accordéons, formulaires
│   └── img/                   illustrations SVG + favicon
├── consulting/
│   ├── index.html  expertises.html  afrique.html  formation.html
│   ├── cabinet.html  contact.html  mentions-legales.html
│   └── contact.php            traitement du formulaire en hébergement IONOS
├── patrimoine/
│   ├── index.html  investissement.html  acquisition.html  relocation.html
│   ├── biens.html  honoraires.html  contact.html  mentions-legales.html
│   └── contact.php
└── _build/                    générateur (facultatif, voir § 6)
```

---

## 2. Mise en ligne

Le site est publié sur **Vercel**, le nom de domaine restant acheté et administré chez **IONOS**.

### Projet Vercel

- **Root Directory** : `sites/allcx`
- **Framework Preset** : Other — aucune commande de build, les fichiers sont servis tels quels
- `vercel.json` fixe les en-têtes de sécurité et la politique de cache
- `.vercelignore` exclut `_build/`, `README.md` et les fichiers `contact.php`
  (le PHP ne s'exécute pas sur Vercel : servi en statique, il exposerait l'adresse de réception)

### Brancher le domaine

1. Dans le projet Vercel : **Settings → Domains → Add**, saisir `allcx-consulting.com`
   (ajouter aussi `www.allcx-consulting.com`, Vercel propose la redirection automatiquement).
2. Vercel affiche alors les enregistrements DNS exacts à créer. **Recopier ces valeurs telles
   quelles** : la cible du `CNAME` est propre à chaque projet et ne correspond plus aux valeurs
   génériques que l'on trouve dans les tutoriels.
3. Côté IONOS : **Domaines & SSL → allcx-consulting.com → DNS**, créer l'enregistrement `A` sur
   `@` et l'enregistrement `CNAME` sur `www` avec les valeurs affichées par Vercel.

Ne **pas** déléguer les serveurs de noms (nameservers) à Vercel : cela déplacerait l'intégralité
du DNS, enregistrements `MX` compris, et interromprait la messagerie `@allcx-consulting.com`.
En ne touchant qu'aux enregistrements `A` et `CNAME`, la messagerie n'est jamais concernée.

Le certificat HTTPS est émis automatiquement par Vercel une fois la propagation effectuée
(de quelques minutes à quelques heures).

### Variante : hébergement IONOS classique

Le site reste déployable sur un hébergement de fichiers ordinaire : envoyer par FTP **le contenu**
du dossier `sites/allcx/` (et non le dossier lui-même) dans le répertoire racine, généralement
`/` ou `/htdocs`. Dans ce cas, remettre l'attribut `action="contact.php"` sur les deux formulaires
(voir § 3) et ne pas envoyer les dossiers `_build/` ni `api/`.

## 3. Formulaires de contact

Les deux formulaires envoient vers `POST /api/contact`, une fonction serverless sans aucune
dépendance (`api/contact.js`). Elle valide les champs, filtre les robots via un champ piège, puis
transmet le message par l'API HTTP de [Resend](https://resend.com) — le SMTP direct étant
généralement bloqué depuis une fonction serverless.

### Variables d'environnement à définir dans Vercel

*Settings → Environment Variables*, pour les environnements Production et Preview :

| Variable | Rôle |
|---|---|
| `RESEND_API_KEY` | clé d'API Resend |
| `CONTACT_FROM` | expéditeur, sur un domaine vérifié chez Resend (ex. `site@allcx-consulting.com`) |
| `CONTACT_TO_CONSULTING` | destinataire des demandes Consulting |
| `CONTACT_TO_PATRIMOINE` | destinataire des demandes Patrimoine |
| `CONTACT_TO` | destinataire de repli si les deux précédentes sont absentes |

Créer un compte Resend, y vérifier le domaine `allcx-consulting.com` (trois enregistrements DNS
à ajouter chez IONOS, sans incidence sur la messagerie existante), puis générer la clé.

### Tant que ce n'est pas configuré

La fonction répond `503` et le formulaire bascule automatiquement sur l'ouverture du logiciel de
messagerie du visiteur, avec la demande préremplie. Rien n'est perdu, mais le parcours est moins
soigné : à configurer avant la mise en avant du site.

### Sans JavaScript

Le formulaire est envoyé de façon classique et la fonction redirige vers la page de contact avec
`?envoi=ok` ou `?envoi=erreur`, message affiché à l'arrivée.

### Sur hébergement IONOS

Les fichiers `consulting/contact.php` et `patrimoine/contact.php` sont conservés pour ce cas :
vérifier la variable `$destinataire` en tête de fichier, puis remplacer `action="/api/contact"`
par `action="contact.php"` et `data-form="api"` par `data-form="mailto"` dans les deux pages
`contact.html` — ou modifier la fonction `contact_form` de `_build/build.py` et régénérer.

## 4. À compléter avant la mise en ligne

Toutes les informations manquantes apparaissent sur le site en rouge, soulignées en pointillé,
avec le libellé « à compléter ». On les retrouve toutes d'un coup :

```sh
grep -rn "à compléter" --include="*.html" .
```

Liste des éléments attendus :

**Coordonnées (les deux univers)**
- Numéro de téléphone
- Adresse postale du siège
- Adresses de réception : `contact@allcx-consulting.com` et `patrimoine@allcx-consulting.com`
  sont proposées par défaut ; **ces boîtes doivent être créées dans IONOS**, sinon il faut les
  remplacer par une adresse existante (modifiable en tête de `_build/build.py`).

**Mentions légales (les deux univers)**
- Capital social, siège social, ville et numéro RCS, numéro de TVA intracommunautaire
- Date de dernière mise à jour

**ALLCX Consulting**
- Numéro de déclaration d'activité de prestataire de formation
- Certification Qualiopi, le cas échéant
- Parcours détaillé du dirigeant (page « Le cabinet »)
- Médiateur de la consommation, si des prestations sont vendues à des particuliers

**ALLCX Patrimoine**
- Garantie financière, ou mention de non-détention de fonds
- Assurance de responsabilité civile professionnelle : assureur, n° de contrat, couverture
- Médiateur de la consommation (obligatoire)
- **Barème d'honoraires complet** (`patrimoine/honoraires.html`) : son affichage est imposé par
  l'arrêté du 10 janvier 2017 et fait l'objet de contrôles

**Point à valider**
- La page `patrimoine/relocation.html` mentionne nommément le partenariat avec l'AS Saint-Étienne.
  Vérifier que le club autorise cette citation avant publication ; à défaut, remplacer par une
  formulation générique (« un club de football professionnel français »).
- Les deux phrases mises en exergue sont attribuées à Fabrice Ekissi : les faire valider ou
  les remplacer.

---

## 5. Images

Les illustrations d'architecture (`assets/img/*.svg`) ont été dessinées spécifiquement pour ce
site : elles sont libres de droits pour ALLCX et ne posent aucun problème de licence.

Pour les remplacer par de vraies photographies, il suffit de changer l'attribut `src` des
balises `<img>` correspondantes. Recommandations :

- format **WebP** ou **JPEG** de bonne qualité, largeur 1600 px, poids < 250 Ko ;
- rapport **4/3** pour les vignettes de la page « Les biens », libre ailleurs ;
- conserver l'attribut `alt` et l'adapter à la photo réelle ;
- garder `loading="lazy"` sauf pour la première image de la page d'accueil.

Attention : ne publier que des photographies dont ALLCX détient les droits, et ne jamais
présenter une illustration comme un bien réellement disponible.

---

## 6. Régénérer le site (facultatif)

Les pages HTML sont livrées prêtes à l'emploi et se modifient directement dans un éditeur de
texte. Un générateur est fourni pour les cas où l'on veut modifier le menu, le pied de page ou
les coordonnées **en un seul endroit** :

```sh
cd sites/allcx
python3 _build/build.py
```

- `_build/build.py` — coordonnées, menus, en-tête, pied de page, mentions légales, sitemap
- `_build/content_*.py` — contenu rédactionnel de chaque page
- `_build/diagram.py` — schéma des marchés d'Afrique francophone

Le script réécrit les fichiers HTML, `sitemap.xml` et `robots.txt`. Il n'exige que Python 3,
sans aucune bibliothèque externe.

---

## 7. Choix techniques

- **Aucune dépendance externe** en dehors des polices Google Fonts (Archivo + Inter pour
  Consulting, Cormorant Garamond + Jost pour Patrimoine). Pour supprimer cette dépendance,
  héberger les fichiers de police dans `assets/` et remplacer le `<link>` par une règle
  `@font-face`.
- **Aucun cookie**, aucun traceur, aucun outil de mesure d'audience : rien à déclarer, pas de
  bandeau de consentement nécessaire en l'état.
- **Accessibilité** : structure sémantique, lien d'évitement, contrastes conformes, navigation
  au clavier, `aria-expanded` sur les composants interactifs, animations désactivées si le
  système du visiteur le demande.
- **Référencement** : titres et descriptions propres à chaque page, URL canoniques, Open Graph,
  données structurées `ProfessionalService` et `RealEstateAgent`, `sitemap.xml`, `robots.txt`.
- **Impression** : feuille de style dédiée, utile pour les mentions légales et le barème.

---

## 8. Plan Vercel

Le plan Hobby de Vercel est réservé à un usage non commercial. Un site vitrine exploité pour le
compte d'un client relève du plan Pro. À arbitrer avant la mise en production définitive.

## 9. Sécurité

Ne jamais enregistrer d'identifiants (IONOS, messagerie, banque) dans ce dépôt ni dans un
fichier du site. Si des identifiants ont été transmis par messagerie ou par courriel, changer
le mot de passe concerné depuis l'espace client et activer la double authentification.
