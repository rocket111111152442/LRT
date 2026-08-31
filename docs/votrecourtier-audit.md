# Audit de votrecourtier.ch — préparation de la refonte

**Statut :** audit réalisé le 31/08/2026, à distance, accès réseau limité.
**Portée :** base de contenu réel pour la refonte de démonstration
`sites/votrecourtier-redesign`.

## 0. Méthodologie et avertissement important

⚠️ **Correction d'une erreur précédente.** Des sessions antérieures dans cet
environnement (voir `sites/neho-redesign`, `sites/allcx-patrimoine`) ont
travaillé sur des sociétés immobilières suisses différentes (Neho SA,
ALLCX Patrimoine), sans rapport avec votrecourtier.ch. Ce document et le
dossier `sites/votrecourtier-redesign` corrigent le tir : ils portent
exclusivement sur **votrecourtier.ch SA**. Les autres dossiers `sites/*`
ne sont pas modifiés ni réutilisés pour ce projet.

L'accès direct (`WebFetch`) au domaine `votrecourtier.ch` est bloqué par le
proxy de sortie réseau de cet environnement (`EGRESS_BLOCKED`), comme pour
la plupart des domaines externes. Il n'a donc pas été possible de charger
directement le HTML du site. L'audit ci-dessous a été reconstitué via des
recherches web ciblées (extraits d'indexation, pages tierces citant le
contenu du site : annuaires professionnels, registre du commerce, portails
immobiliers, avis clients publics).

**Avant toute mise en production réelle**, quelqu'un ayant un accès direct
au site doit ouvrir chaque page de votrecourtier.ch et confirmer les textes
exacts, prix, chiffres et coordonnées. Tout chiffre non confirmé de façon
indépendante par plusieurs sources est signalé ci-dessous.

## 1. Résumé exécutif

**votrecourtier.ch SA** est une agence de courtage immobilier suisse basée
dans le canton de Vaud, avec une antenne à Fribourg. Present en Suisse
romande depuis 2006 (parcours professionnel du fondateur), société
`votrecourtier.ch SA` inscrite au registre du commerce vaudois le
23.08.2016 (UID CHE-462.248.611). Spécialisée dans :

- le courtage immobilier (vente de biens résidentiels et d'investissement) ;
- le développement foncier et l'achat de terrains ;
- la vente de terrains pour le compte de propriétaires ;
- la commercialisation de projets neufs (vente sur plan) ;
- l'estimation immobilière gratuite par un expert breveté.

## 2. Coordonnées confirmées

| Antenne | Adresse | Téléphone | Email |
|---|---|---|---|
| Lausanne / Crissier | Rue de Cossonay 5, 1023 Crissier | +41 21 701 26 26 | lausanne@votrecourtier.ch |
| Fribourg / Marly | Chemin du Publiet 60, 1723 Marly | +41 26 430 01 84 | fribourg@votrecourtier.ch |

Source : search.ch, local.ch, immobilier.ch, moneyhouse.ch (fiches
d'annuaire professionnel citant le registre du commerce).

## 3. La figure experte : Alexandre Mirfassihi

- Développeur immobilier avec **brevet fédéral**.
- Ingénieur agronome HES.
- Courtier qualifié **USPI** (Union suisse des professionnels de
  l'immobilier).
- Expert en estimations immobilières avec brevet fédéral, membre de la
  **CEI** (Chambre suisse d'experts en estimation immobilière).
- Membre du conseil d'administration de votrecourtier.ch SA.
- Parcours : formation en négoce de matières premières (multinationale
  américaine, puis Credit Suisse) → 2006, rejoint le groupe
  Foncia/Domicim/DBS comme courtier principal puis responsable des ventes
  du département valorisation & projets neufs pour les cantons de Vaud et
  Fribourg → groupe Barnes/Gerofinance, sous-directeur du département
  valorisation & projets neufs Vaud & Fribourg.

Ce parcours donne le point de départ « 2006 » utilisé dans la refonte
comme repère d'ancienneté de l'expertise (et non comme date de création de
la SA, qui date de 2016 — distinction à conserver, cf. §6 de l'audit Neho
pour l'exemple d'un piège similaire).

## 4. Pages identifiées (sourcées par indexation)

| Page | URL |
|---|---|
| Accueil | `votrecourtier.ch/` |
| À propos | `votrecourtier.ch/a-propos/` |
| Développement foncier | `votrecourtier.ch/developpement-foncier/` |
| Vendre mon terrain | `votrecourtier.ch/vendre-mon-terrain/` |
| Biens résidentiels (vente) | `votrecourtier.ch/biens-residentiels/` |
| Biens d'investissement | `votrecourtier.ch/biens-dinvestissements/` |
| Projets neufs | `votrecourtier.ch/projets-neufs/` |
| Tous nos biens | `votrecourtier.ch/tous-nos-biens/` |
| Estimation immobilière | `votrecourtier.ch/estimation-immobiliere/` |
| Contact | `votrecourtier.ch/contact/` |
| Blog | `votrecourtier.ch/blog/` |
| Pages locales (échantillon) | `agence-immobiliere-a-lausanne`, `-a-fribourg`, `-a-marly`, `-a-nyon`, `-a-morat`, `-a-lutry`, `-a-neyruz`, `-a-rolle`, `-a-corminboeuf` |
| Article blog (exemples) | `blog/meilleure-agence-immobiliere-suisse`, `blog/cecb-obligatoire-vendre-bien-immobilier`, `blog/prix-immobilier-cadre-vie-corminboeuf` |

**Non confirmées / non trouvées :** page mentions légales exacte, CGU,
page connexion/compte client (rien n'indique qu'un tel espace existe —
la refonte n'en crée donc pas), sitemap.xml direct.

## 5. Chiffres — statut de vérification

| Chiffre | Statut |
|---|---|
| Présent en Suisse romande depuis **2006** | confirmé (parcours du fondateur, répété sur plusieurs pages) |
| SA fondée le **23.08.2016** | confirmé (registre du commerce, UID CHE-462.248.611) |
| **Plus de 750 biens vendus** | trouvé sur une seule synthèse tierce — repris avec prudence, formulé « plusieurs centaines de biens vendus » dans les zones à faible enjeu, chiffre exact affiché uniquement là où sourcé |
| Cantons couverts : **Vaud et Fribourg** | confirmé (deux antennes, nombreuses pages locales dans ces deux cantons) |
| Témoignages clients positifs citant « M. Mirfassihi » | confirmés (plusieurs avis publics indépendants), mais **noms complets des clients non vérifiés** → repris de façon anonymisée dans la refonte (ex. « Vente d'appartement, Lausanne ») plutôt que sous forme de fausses citations nominatives |

Aucune récompense, certification autre que celles listées au §3, ni
statistique non listée ici n'est utilisée dans la refonte.

## 6. Ce que la refonte conserve

- Le double ancrage Vaud/Fribourg, Lausanne (Crissier) et Fribourg (Marly).
- L'accompagnement humain porté par un expert identifié (Alexandre
  Mirfassihi), brevet fédéral de développeur immobilier + expert en
  estimation.
- Les cinq piliers de service : développement foncier, vente de terrains,
  vente de biens résidentiels/investissement, projets neufs, estimation.
- L'ancienneté réelle (expertise depuis 2006) sans la confondre avec la
  date de création de la SA (2016).
- Le principe de pages locales par ville (SEO local), traité comme un
  gabarit data-driven plutôt que dupliqué à la main.

## 7. Ce que la refonte ne fait pas

- Elle ne copie aucune donnée réelle de biens en vente ni aucune donnée
  personnelle de client : jeu de données de démonstration clairement
  identifié comme tel.
- Elle n'invente aucun chiffre, prix de vente, avis nominatif ou
  certification au-delà de ce qui précède.
- Elle ne reproduit pas des dizaines de pages locales : quelques pages
  réelles (Lausanne, Fribourg, Marly + 2-3 autres) servent de démonstration
  du gabarit, documenté pour être étendu.
