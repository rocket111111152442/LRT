# Audit du site actuel — Agence ADIMEN

**Site audité :** https://www.agence-adimen.ch/
**Date de l'audit :** 31 août 2026
**Auteur :** refonte `sites/adimen`

---

## 0. Méthode et limite importante

Le domaine `www.agence-adimen.ch` est **bloqué par la politique de sortie réseau** de
l'environnement d'exécution utilisé pour cette refonte :

```
kind: connect_rejected
detail: gateway answered 403 to CONNECT (policy denial or upstream failure)
host: www.agence-adimen.ch:443
```

Le crawl direct (navigateur, `curl`, récupération de page) a donc été **impossible**. Conformément
aux règles de l'environnement, la politique n'a pas été contournée.

L'audit a été reconstitué à partir de deux sources autorisées :

1. **L'index des moteurs de recherche** — titres de balises `<title>`, extraits de contenu,
   et surtout la **liste des URL réellement indexées**, qui donne l'arborescence effective du site.
2. **Les annuaires suisses** (search.ch, local.ch, zip.ch, Moneyhouse, registre du commerce) pour
   recouper les coordonnées et la raison sociale.

**Conséquence à connaître :** tout ce qui est marqué `⚠︎ À VÉRIFIER` ci-dessous n'a pas pu être lu
sur la page elle-même. Ces points sont repris dans `sites/adimen/CONTENU-A-VALIDER.md` et doivent
être confirmés page par page avant mise en ligne. **Aucune information non vérifiée n'a été inventée
ni publiée sur le nouveau site.**

---

## 1. Inventaire des URL

### 1.1 Pages françaises indexées

| # | URL | Balise `<title>` indexée | Observation |
|---|-----|--------------------------|-------------|
| 1 | `/` | Agence ADIMEN - Détectives privés Genève | Accueil |
| 2 | `/agence-detective-prive/` | L'agence ADIMEN *(aussi indexé « Notre agence de détectives privés »)* | Titre instable |
| 3 | `/garantie-agence-detective/` | Nos garanties d'agence de détective privé | |
| 4 | `/detective-geneve/` | Agence de détective privé à Genève | Page locale |
| 5 | `/detective-lausanne/` | Agence de détective privé à Lausanne | **Indexée en `http://`** |
| 6 | `/emplois/` | Nos garanties d'agence de détective privé | **Titre dupliqué avec #3** |
| 7 | `/agence-detective-prive-particuliers/` | Services de détective privé pour particuliers | |
| 8 | `/services-aux-particuliers/` | Services aux particuliers | **Quasi-doublon de #7** |
| 9 | `/detective-prive-entreprises/` | Détective privé pour entreprises, enquêtes | |
| 10 | `/services-aux-entreprises/` | Service D'intervention | **Titre sans rapport ; quasi-doublon de #9** |
| 11 | `/services-aux-parents/` | Services aux parents | |
| 12 | `/services/contre-mesures/` | Agence de détective privé : contre-filature | Seule URL à segment imbriqué |
| 13 | `/detective-prive-tarifs-prix/` | Tarifs détectives privés - Prix et conditions | |
| 14 | `/resau-international-detective/` | Un réseau de détectives privés dans le monde entier | **Faute de frappe dans l'URL : `resau`** |
| 15 | `/contacter-agence-detective-prive/` | Contacter notre agence de détective privé à Genève | |
| 16 | `/infidelite-adultere/` | Agence de détective privé : infos sur l'alcool | **Titre sans rapport avec l'URL** |
| 17 | `/plus-de-details-sur-la-drogue/` | Problèmes liés à la drogue | |

### 1.2 Pages anglaises indexées

| # | URL | Balise `<title>` indexée | Observation |
|---|-----|--------------------------|-------------|
| 18 | `/en/lagence-adimen/` | The agency ADIMEN | Slug resté en français |
| 19 | `/en/en-detective-prive-geneve/` | EN- Agence de détective privé à Genève | **Préfixe « EN- » visible dans le titre ; titre en français** |
| 20 | `/en/contact-en/` | EN- Contacter notre agence de détective privé à Genève | **Idem** |
| 21 | `/en/reseau-international/` | Un réseau de détectives privés dans le monde entier | Slug correct ici, fautif en FR (#14) |
| 22 | `/en/detective-prive-tarifs-prix/` | Tarifs détectives privés - Prix et conditions | Titre en français |
| 23 | `/en/detective-prive-lausanne/` | Agence de détective privé à Lausanne | Titre en français |
| 24 | `/en/service-de-contre-mesures/` | Agence de détective privé à Genève | **Titre sans rapport** |
| 25 | `/en/services-for-parents/` | Services to parents | |

### 1.3 Pages annoncées mais non retrouvées dans l'index

- **Médias** (reportages RTS) — ⚠︎ À VÉRIFIER : aucune URL indexée. Le nouveau site prévoit la page
  et sa structure, mais **les URL des reportages RTS n'ont pas pu être relevées** et ne sont donc
  pas inventées.
- **Politique de confidentialité** — ⚠︎ À VÉRIFIER : non indexée.
- **Gestion des cookies** — ⚠︎ À VÉRIFIER : non indexée.
- **`sitemap.xml`** — inaccessible (blocage réseau).

### 1.4 Volumétrie

**25 URL confirmées** (17 FR + 8 EN), auxquelles s'ajoutent au moins 3 pages annoncées non
indexées. Le site présente donc une **duplication structurelle** : trois couples de pages traitent
le même sujet (particuliers ×2, entreprises ×2, contre-mesures FR/EN incohérentes).

---

## 2. Coordonnées relevées

| Bureau | Adresse | Téléphone |
|---|---|---|
| **Genève** | Rue du Grand-Bureau 11, CH-1227 *(Les Acacias / Carouge — voir §4.1)* | +41 22 300 38 05 |
| **Lausanne** | Rue du Simplon 37, CH-1006 Lausanne | +41 21 973 22 82 |
| **Montreux** | Rue de l'Église Catholique 10, CH-1820 Montreux | ⚠︎ non relevé |
| **Sion** | Case postale 2018, CH-1950 Sion 2 | +41 27 203 47 15 |

- **E-mail :** `info@agence-adimen.ch`
- **Réseau social :** page Facebook `@agenceadimen`
- **Raison sociale :** deux entités apparaissent au registre — **Adimen Sàrl** (CHE-134.274.180,
  Les Acacias) et **Agence Adimen Investigations Carrecabe**. ⚠︎ À VÉRIFIER : laquelle doit figurer
  dans les mentions légales.

### Horaires

- **Site :** « du lundi au vendredi de 8h à 20h », intervention terrain « 7 j/7, 24 h/24 ».
- **local.ch :** lundi–**samedi** 8h00–20h00, dimanche fermé.

→ **Contradiction** (voir §4.2).

---

## 3. Contenu factuel repris (vérifié sur deux sources au minimum)

Ces éléments sont **repris tels quels** dans la refonte, car recoupés :

- Agence **agréée par le Conseil d'État** à Genève ; agents **titulaires de l'autorisation du DSE**
  (Département de la sécurité et de l'économie).
- **Plus de 10 ans** d'expérience terrain ; spécialisation **enquêtes privées et commerciales**.
- Couverture : **Suisse, zone Europe, Canada, États-Unis** ; réseau international de collaborateurs
  issus du renseignement et du droit ; plusieurs implantations à l'étranger.
- **Honoraires : CHF 90 à CHF 240 de l'heure** pour enquêtes et filatures ; montant fonction de la
  complexité, du temps consacré et des ressources humaines et techniques. **Forfait** pour les
  recherches administratives.
- **Information en temps réel** de l'avancée et des frais engagés ; le client peut dire « STOP » à
  tout moment.
- **Évaluation gratuite et sans engagement**, avec étude de coût et de faisabilité.
- **Rapport détaillé et horodaté** en fin de mission, comprenant **photos et vidéos** des preuves
  recueillies.
- Données conservées sur des **serveurs sécurisés en Suisse**.
- Compétences terrain citées : **vidéo-surveillance, infiltration, détection de caméras et micros
  espions**.
- **Contre-mesures :** détection de micros, caméras espions et balises de géolocalisation sur
  véhicule ; protection des locaux professionnels, domiciles privés et véhicules.
- **Particuliers :** enquêtes de moralité, suspicion d'infidélité, filature, surveillance, rapports
  conflictuels (travail, voisinage, garde d'enfant), menace, abus de confiance, recherche de
  personne disparue.
- **Entreprises :** enquêtes pré-relation d'affaires, contrôle de solvabilité, vérification de
  réputation, suivi en matière d'assurance maladie et accident, arrêts de travail suspects,
  vérification de sous-location, rapports pour investissements immobiliers. Clientèle : cabinets
  d'avocats, PME locales, groupes nationaux et internationaux, compagnies d'assurance, régies
  immobilières, agences publiques.
- **Parents :** accompagnement des familles en difficulté, contexte social et environnement des
  enfants, contrôle de consommation d'alcool et de stupéfiants chez l'adulte ou l'adolescent.
- **Emplois :** recrutement de collaborateurs contractuels ; profils issus d'une école de détective ;
  permis **B** et **A**, maîtrise des outils bureautiques, **OSINT / OPSEC**, compétences en
  électronique, goût du travail en équipe.

### Ce qui n'a **pas** été repris faute de vérification

- Aucun chiffre d'affaires, nombre de dossiers, taux de réussite ou effectif.
- Aucun témoignage, avis client, note ou distinction.
- Aucun nom de collaborateur.
- Aucun partenariat ou accréditation autre que l'agrément Conseil d'État / DSE ci-dessus.
- Aucun prix autre que la fourchette CHF 90–240/h et le principe du forfait administratif.

---

## 4. Incohérences et défauts relevés

### 4.1 Adresse du siège genevois — **Les Acacias** ou **Carouge** ?

Le code postal 1227 est partagé par **Les Acacias** (commune de Genève) et **Carouge**. Les sources
divergent :

- Registre du commerce, Moneyhouse, search.ch, local.ch, zip.ch → **1227 Les Acacias**
- Certaines pages du site → **1227 Carouge**

Rue du Grand-Bureau 11 se situe aux **Acacias**. La refonte affiche donc `1227 Les Acacias`, valeur
appuyée par le registre du commerce, **mais le point est signalé pour validation** : il conditionne
la cohérence NAP (Name-Address-Phone) du référencement local et de la fiche Google Business.

### 4.2 Horaires contradictoires

Site : lundi–vendredi. local.ch : lundi–samedi. → à trancher, puis à aligner sur les deux supports.

### 4.3 Défauts SEO structurels

| Défaut | Détail |
|---|---|
| **Titre dupliqué** | `/emplois/` et `/garantie-agence-detective/` partagent le même `<title>` |
| **Titres sans rapport** | `/infidelite-adultere/` → « infos sur l'alcool » ; `/services-aux-entreprises/` → « Service D'intervention » ; `/en/service-de-contre-mesures/` → « …à Genève » |
| **Faute dans une URL** | `/resau-international-detective/` (manque le `é`/`e` de « réseau ») — l'URL EN est correcte |
| **Préfixe technique visible** | « EN- » en tête des titres de deux pages anglaises |
| **Version EN non traduite** | Titres et contenus des pages `/en/` majoritairement en français ; pas de `hreflang` observable |
| **Contenu dupliqué** | particuliers ×2, entreprises ×2 — cannibalisation entre pages sur les mêmes requêtes |
| **Protocole mixte** | `/detective-lausanne/` indexée en `http://` |
| **Arborescence incohérente** | une seule URL imbriquée (`/services/contre-mesures/`), toutes les autres à plat |

### 4.4 Cohérence éditoriale

- Le périmètre géographique varie : « Genève et Lausanne » sur certaines pages, quatre bureaux
  (Genève, Lausanne, Montreux, Sion) sur d'autres. La refonte retient les **quatre implantations**,
  les quatre étant documentées par les annuaires.
- Répétition marquée de la formule « détective privé à Genève » d'une page à l'autre.
- La page `/plus-de-details-sur-la-drogue/` cite une statistique ESPAD (≈ 75 % des jeunes de 15 ans
  en Suisse ayant consommé de l'alcool dans le mois précédant l'enquête). ⚠︎ Non reprise : la source
  et le millésime n'ont pas pu être vérifiés sur la page.

---

## 5. Plan de reprise et redirections

L'objectif est de **conserver la valeur SEO** : toutes les URL ci-dessus reçoivent une redirection
**301** vers leur équivalent dans la nouvelle arborescence. Le détail est implémenté dans
`sites/adimen/next.config.ts` et récapitulé dans `sites/adimen/README.md`.

Principe retenu :

- Les deux pages « particuliers » fusionnent vers `/services/particuliers`.
- Les deux pages « entreprises » fusionnent vers `/services/entreprises`.
- Les pages thématiques `/infidelite-adultere/` et `/plus-de-details-sur-la-drogue/` deviennent des
  sections des pages Particuliers et Parents, ciblées par ancre.
- L'URL fautive `/resau-international-detective/` **et** sa forme correcte redirigent vers
  `/reseau-international`.
- Les URL `/en/*` redirigent vers leur équivalent français, la refonte étant livrée en français
  uniquement (voir §6).

---

## 6. Points laissés hors périmètre, à décider

1. **Version anglaise** — la version `/en/` existante est incomplète et non traduite. La refonte est
   livrée **en français**, avec une architecture i18n-ready (contenu centralisé, aucune chaîne en
   dur dans les composants). Une traduction professionnelle est nécessaire avant de rouvrir `/en/`.
2. **Reportages RTS** — structure de page prête, **URL des reportages à fournir**.
3. **Photographies** — aucune photo de l'agence ou de ses agents n'a pu être récupérée. Le nouveau
   site n'utilise **aucune photo de personne** et repose sur une direction artistique graphique et
   3D, ce qui évite toute présentation trompeuse d'un agent ADIMEN.
4. **Textes juridiques** — politique de confidentialité et politique cookies rédigées sur la base du
   cadre suisse (nLPD) mais **à faire relire**, les versions existantes n'ayant pas pu être lues.
