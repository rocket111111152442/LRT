# Audit de courvoisier.immo — préparation du concept de refonte

**Statut :** audit réalisé le 31/08/2026, à distance, avec un accès réseau limité.
**Portée :** ce document sert de base au concept de refonte privé
(`sites/courvoisier-immobilier-refonte`). Il ne doit pas être diffusé comme
une fiche officielle sur Courvoisier Immobilier SA.

## 0. Méthodologie et limite importante

L'environnement d'exécution utilisé pour cette mission bloque l'accès direct
(`WebFetch`) au domaine `courvoisier.immo` (proxy de sortie réseau restreint :
erreur `EGRESS_BLOCKED`). Il n'a donc **pas été possible de naviguer
directement sur le site ni d'inspecter son HTML, ses images ou son
JSON-LD**.

L'audit ci-dessous a été reconstitué via des recherches web ciblées
(extraits d'indexation, titres de pages, méta-descriptions cités par le
moteur de recherche). C'est une base **sérieuse mais partielle** :

- Les faits listés en §1 à §5 proviennent de résultats de recherche réels
  et sont sourcés page par page.
- Aucun prix, aucune surface exacte de bien courant, aucun nom/texte exact
  de témoignage client et aucune statistique d'entreprise (nombre de ventes,
  chiffre d'affaires, année par année) n'a pu être vérifié verbatim dans cet
  environnement. Ces éléments sont **volontairement absents ou traités comme
  contenu de démonstration explicitement signalé** dans le concept — voir
  §6. Conformément à la consigne du mandat, rien n'est inventé et présenté
  comme un fait réel de Courvoisier.
- **Avant toute présentation à un tiers ou mise en production**, quelqu'un
  ayant un accès réseau normal doit ouvrir courvoisier.immo et confirmer :
  biens en vente/location actuels, prix, équipe complète, témoignages
  verbatim, disponibilités des promotions. Le concept a été construit pour
  que ces valeurs se branchent depuis un point unique
  (`src/lib/data/*.ts`), afin que cette vérification soit rapide et que rien
  ne soit dispersé dans les composants.

## 1. Résumé exécutif

Courvoisier Immobilier est une agence immobilière indépendante fondée en
**2020 à Lausanne par Dimitri et Célia Courvoisier**, ancrée dans la région
de La Côte (arc lémanique vaudois). Positionnement confirmé : agence
indépendante, exigeante et transparente, active sur trois métiers —
**courtage, promotion et gérance** — avec un service de **conseil et
développement** transversal. ([a-propos](https://www.courvoisier.immo/a-propos/))

- **Fondateurs :** Dimitri Courvoisier (titulaire du brevet fédéral de
  développeur immobilier) et Célia Courvoisier (diplômée en économie,
  ex-conseil aux entreprises dans la santé, en charge des bases
  administratives et stratégiques). ([a-propos](https://www.courvoisier.immo/a-propos/))
- **Équipe :** l'agence a grandi jusqu'à réunir des profils complémentaires
  — courtiers, spécialistes du marché, experts en gérance et en promotion —
  au sein de trois agences. Un chiffre de « 9 collaborateurs » apparaît dans
  l'indexation mais n'a pas pu être revérifié verbatim page par page — **à
  vérifier** avant publication.
- **Agences (adresses confirmées) :**
  - Lausanne — Place de la Navigation 2, 1006 Lausanne
  - Rolle — Rue du Temple 7A, 1180 Rolle
  - Lonay — Rte de Denges 10, 1027 Lonay
  ([contact](https://www.courvoisier.immo/contact/))
- **Contact confirmé :** +41 21 728 50 50 · info@courvoisier.immo
- **Réseaux :** Instagram `@courvoisier_immobilier`, page Facebook « Courvoisier
  Immobilier | Lausanne ».

## 2. Arborescence observée (sourcée)

| Page | URL observée | Objet |
|---|---|---|
| Accueil | `courvoisier.immo/` | Vitrine — vente, location, estimation |
| À propos | `courvoisier.immo/a-propos/` | Histoire, mission, valeurs, fondateurs |
| Contact | `courvoisier.immo/contact/` | Coordonnées des 3 agences |
| Estimer | `courvoisier.immo/estimer/` | Estimation gratuite : en vrai / visio / en ligne |
| Vendre | `courvoisier.immo/sell/` | Méthode de vente, valorisation |
| Promotion | `courvoisier.immo/promotion/` | Accompagnement promoteurs/investisseurs A à Z |
| Gérance | `courvoisier.immo/gerance/` | Gestion locative, mise en valeur du patrimoine |
| Fiche bien | `courvoisier.immo/objet/{id}/` | Détail d'un bien (ex. immeuble à Féchy) |

Remarque : l'URL vendeur observée dans l'indexation (`/sell/`) est en
anglais alors que le reste du site est en français — probablement un
héritage technique du CMS. Le concept utilise des URLs françaises
cohérentes (`/vendre`) ; si le site réel utilise encore `/sell/` en
production, prévoir une redirection 301 lors du déploiement réel (voir
§7).

## 3. Métiers confirmés

1. **Courtage** — accompagnement acheteurs/vendeurs, vente résidentielle et
   commerciale, immeubles de rendement.
2. **Promotion / Développement** — accompagnement des promoteurs,
   investisseurs et propriétaires fonciers « à travers toutes les étapes du
   développement immobilier », de l'étude à la commercialisation.
3. **Conseil** — financement, fiscalité, potentiel d'un bien (transformation,
   division), recherche de partenaires/architectes.
4. **Gérance** — gestion locative complète d'immeubles, appartements ou
   propriétés privées ; suivi administratif, comptable et technique ;
   relation locataires ; valorisation patrimoniale.
5. **Estimation** — trois formats confirmés : **en vrai** (déplacement d'un
   courtier), **en visio** (visioconférence, rapide, sans rendez-vous à
   domicile), **en ligne** (fourchette de prix basée sur le marché local en
   quelques clics). Facteurs pris en compte cités : emplacement, état
   général, surface, année de construction, taille du terrain, proximité
   des infrastructures, potentiel de valorisation.

## 4. Promotions immobilières confirmées

- **Résidence NAMAYA** — Rolle, architecte Gabriele Rossi, entre Genève et
  Lausanne, quartier résidentiel calme proche du Léman. Appartements de
  3.5 à 4.5 pièces (105 à 147 m²), intérieurs personnalisables. Livraison
  annoncée : été 2026. ([guideimmoneuf.ch](https://guideimmoneuf.ch/promoteur/courvoisier-immobilier/))
- **Résidence TerraVista** — proche de Lausanne, quatre appartements haut de
  gamme (un par étage), ascenseur privatif, grands espaces extérieurs, vue
  dégagée, finitions soignées.

Aucun prix, aucun plan, aucun taux de disponibilité exact n'a pu être
vérifié pour ces deux promotions : le concept les présente avec uniquement
les faits ci-dessus et un bandeau « disponibilités à confirmer auprès de
l'agence ».

## 5. Témoignages

Les extraits indexés confirment l'existence de nombreux avis positifs
(profesionnalisme, écoute, qualités humaines, réactivité, un collaborateur
cité nommément — « M. Durrer »). Aucun texte verbatim ni nom de client
n'a pu être confirmé mot pour mot dans cet environnement. **Décision
éditoriale du concept :** la page Témoignages est construite avec le
traitement éditorial demandé par le mandat (grande typographie, peu
d'éléments), mais les citations affichées sont explicitement signalées
comme des extraits d'exemple à remplacer par les avis vérifiés fournis par
l'agence — jamais présentées comme des citations réelles attribuées à un
client nommé.

## 6. Ce que le concept ne doit jamais inventer

Conformément au mandat (§40 du brief), sont explicitement traités comme
« contenu de démonstration à remplacer », jamais comme des faits réels
affirmés :

- Les biens à vendre/louer autres que les deux promotions sourcées
  ci-dessus (adresses, prix, surfaces, photos).
- Les textes et noms de témoignages clients.
- Le nombre exact de collaborateurs, d'années d'expérience, de ventes
  réalisées ou tout chiffre d'entreprise.
- Les articles de blog présentés comme publications existantes de
  Courvoisier — le concept inclut des articles éditoriaux génériques
  écrits pour la démonstration du gabarit, marqués comme tels.

Chaque page concernée porte une mention discrète renvoyant à ce document.

## 7. SEO — points de vigilance pour un déploiement réel

- Conserver `/estimer`, `/promotion`, `/gerance`, `/a-propos`, `/contact` tels
  quels (déjà cohérents).
- Si l'URL vendeur réelle est `/sell/`, poser une redirection 301 vers
  `/vendre` plutôt que de casser le lien existant.
- Réutiliser les title/meta description déjà indexés comme base (ils sont
  déjà correctement ciblés géographiquement — Lausanne, Rolle, Lonay, La
  Côte) plutôt que de les réécrire entièrement.
- Implémenter les données structurées `RealEstateAgent` (une entité, trois
  `LocalBusiness`/`address` pour les agences), `Organization`,
  `BreadcrumbList`, et `Article` pour le blog — voir
  `src/lib/seo/jsonld.ts` dans le concept.

## Sources

- https://www.courvoisier.immo/a-propos/
- https://www.courvoisier.immo/contact/
- https://www.courvoisier.immo/estimer/
- https://www.courvoisier.immo/promotion/
- https://www.courvoisier.immo/gerance/
- https://guideimmoneuf.ch/promoteur/courvoisier-immobilier/
- https://www.homegate.ch/agency/gp195/courvoisier-immobilier-sa
- https://www.immoscout24.ch/agency/gp195/courvoisier-immobilier-sa
- https://www.editions-bienvivre.ch/courvoisier-immobilier-sa/
