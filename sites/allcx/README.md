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
├── robots.txt  sitemap.xml
├── assets/
│   ├── css/allcx.css          feuille de styles unique (deux thèmes)
│   ├── js/allcx.js            menu, apparitions, accordéons, formulaires
│   └── img/                   illustrations SVG + favicon
├── consulting/
│   ├── index.html  expertises.html  afrique.html  formation.html
│   ├── cabinet.html  contact.html  mentions-legales.html
│   └── contact.php            traitement du formulaire (optionnel)
├── patrimoine/
│   ├── index.html  investissement.html  acquisition.html  relocation.html
│   ├── biens.html  honoraires.html  contact.html  mentions-legales.html
│   └── contact.php
└── _build/                    générateur (facultatif, voir § 6)
```

---

## 2. Mise en ligne chez IONOS

1. Ouvrir l'espace client IONOS → **Hébergement** → **FTP/SFTP** (ou le gestionnaire de fichiers).
2. Envoyer **le contenu** du dossier `sites/allcx/` (et non le dossier lui-même) dans le
   répertoire racine du site, généralement `/` ou `/htdocs`.
   Le dossier `_build/` n'a pas besoin d'être envoyé.
3. Vérifier que `index.html` se trouve bien à la racine : `https://allcx-consulting.com/`
   doit afficher le portail.

### Deux adresses distinctes (recommandé)

Le site fonctionne tel quel en sous-dossiers :

- `allcx-consulting.com/consulting/`
- `allcx-consulting.com/patrimoine/`

Pour donner à chaque marque sa propre adresse, deux possibilités dans IONOS :

- **Sous-domaine** — créer `patrimoine.allcx-consulting.com` et pointer sa racine sur le
  dossier `patrimoine/`. Aucune modification du code n'est nécessaire, sauf les chemins
  `../assets/` qu'il faudra transformer en `assets/` après avoir copié le dossier `assets/`
  dans `patrimoine/`.
- **Second nom de domaine** — par exemple `allcx-patrimoine.com`, en le faisant pointer sur
  le même dossier. C'est l'option la plus claire pour séparer réellement les deux activités.

Dans les deux cas, penser à mettre à jour la constante `SITE_URL` dans `_build/build.py`
(balises `canonical`, `sitemap.xml`, `robots.txt`) ou à corriger ces valeurs à la main.

### HTTPS

Activer le certificat SSL gratuit fourni par IONOS et forcer la redirection HTTP → HTTPS
depuis l'espace client.

---

## 3. Formulaires de contact

Chaque univers a son formulaire, avec deux modes de fonctionnement :

- **Par défaut (aucune configuration)** — à la validation, le navigateur ouvre le logiciel de
  messagerie du visiteur avec un message prérempli. Fonctionne partout, y compris en
  hébergement purement statique.
- **Avec PHP (recommandé)** — les offres d'hébergement web IONOS exécutent PHP.
  Le fichier `contact.php` de chaque dossier envoie la demande par courriel.
  Pour l'activer :
  1. ouvrir `consulting/contact.php` et `patrimoine/contact.php` ;
  2. vérifier la variable `$destinataire` (adresse de réception) ;
  3. dans `_build/build.py`, remplacer `data-form="mailto"` par `data-form="post"` dans la
     fonction `contact_form`, puis régénérer — ou, plus simplement, supprimer l'attribut
     `data-form="mailto"` dans les deux fichiers `contact.html`.

Le formulaire comporte un champ piège anti-robot, une validation côté navigateur et une
validation côté serveur (longueur, format d'adresse, consentement).

---

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

## 8. Sécurité

Ne jamais enregistrer d'identifiants (IONOS, messagerie, banque) dans ce dépôt ni dans un
fichier du site. Si des identifiants ont été transmis par messagerie ou par courriel, changer
le mot de passe concerné depuis l'espace client et activer la double authentification.
