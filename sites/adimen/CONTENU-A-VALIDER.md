# Points à valider avant la mise en ligne

Ce document liste tout ce que la refonte n'a **pas** pu vérifier par elle-même, et
tout ce qui demande une décision humaine. Chaque point indique le fichier à
modifier.

> **Pourquoi cette liste existe.** Le domaine `www.agence-adimen.ch` est bloqué par
> la politique de sortie réseau de l'environnement dans lequel la refonte a été
> réalisée. Le site actuel n'a donc pas pu être parcouru page par page. L'audit a
> été reconstitué à partir de l'index des moteurs de recherche et des annuaires
> suisses — voir `docs/adimen-audit.md § 0`.
>
> **Rien n'a été inventé.** Aucun chiffre, témoignage, avis, accréditation,
> partenariat, prix ni nom de collaborateur n'a été ajouté. Ce qui ne pouvait pas
> être recoupé sur deux sources n'a pas été publié.

---

## 1. Bloquant — à trancher avant publication

### 1.1 Adresse du siège genevois : Les Acacias ou Carouge ?

Le code postal 1227 est partagé par **Les Acacias** (commune de Genève) et
**Carouge**. Les sources divergent :

| Source | Valeur |
|---|---|
| Registre du commerce, Moneyhouse, search.ch, local.ch, zip.ch | 1227 **Les Acacias** |
| Certaines pages du site actuel | 1227 **Carouge** |

**Choix retenu par défaut :** `1227 Les Acacias`, valeur appuyée par le registre du
commerce.

**Pourquoi c'est bloquant :** la cohérence NAP (nom, adresse, téléphone) entre le
site, la fiche Google Business et les annuaires conditionne le référencement
local. Deux valeurs concurrentes le dégradent.

→ **Fichier :** `src/content/site.ts`, constante `geneve`, champ `localite`.

### 1.2 Raison sociale de l'éditeur

Deux entités apparaissent au registre du commerce :

- **Adimen Sàrl** — CHE-134.274.180, Les Acacias
- **Agence Adimen Investigations Carrecabe**

**Choix retenu par défaut :** `Adimen Sàrl` avec l'IDE ci-dessus.

**Pourquoi c'est bloquant :** la dénomination sociale de l'éditeur et le numéro
IDE sont des mentions légales obligatoires. Une erreur y est opposable.

→ **Fichiers :** `src/content/site.ts` (`agence.nomLegal`, `agence.ide`), repris
automatiquement dans `/mentions-legales/`.

### 1.3 Hébergeur, dans les mentions légales

Le paragraphe « Hébergement » de `/mentions-legales/` renvoie explicitement à une
information à compléter selon l'hébergement retenu. Il faut y porter la
dénomination et l'adresse de l'hébergeur effectif.

→ **Fichier :** `src/app/mentions-legales/page.tsx`, section « Hébergement ».

---

## 2. Contradictions relevées à l'audit

### 2.1 Horaires

| Source | Valeur |
|---|---|
| Site actuel | Du **lundi au vendredi**, 8 h – 20 h |
| local.ch | Du **lundi au samedi**, 8 h – 20 h |

**Choix retenu par défaut :** la valeur du site (lundi–vendredi), reprise à la
fois dans le texte visible et dans les données structurées `LocalBusiness`.

→ **Fichier :** `src/content/site.ts`, objet `horaires`. La modification se
répercute sur le pied de page, les pages locales, la page contact et le JSON-LD.

### 2.2 Périmètre géographique

Le site actuel annonce tantôt « Genève et Lausanne », tantôt quatre bureaux. La
refonte retient les **quatre implantations**, toutes documentées par les
annuaires suisses. À confirmer.

---

## 3. Informations manquantes

### 3.1 Téléphone du bureau de Montreux

Aucune source n'a permis de l'établir. La fiche Montreux s'affiche donc sans
numéro direct, et renvoie au standard de Genève. Le composant gère l'absence
sans rien casser.

→ **Fichier :** `src/content/site.ts`, bureau `montreux`, champs `telephone` et
`telephoneAffiche` (actuellement `null`).

### 3.2 Reportages RTS — page Médias

La page « Médias » du site actuel n'a pas pu être consultée, et **aucune source
publique ne permet d'établir qu'ADIMEN a participé à tel ou tel reportage.**

Deux sujets de la RTS traitent de la profession de détective privé à Genève. Ils
sont conservés **en commentaire, hors du site**, à titre de piste uniquement :

- RTS Info — « Le badge de détective privé, un sésame qui attire toujours plus à
  Genève »
- RTS, Temps Présent — « Détectives, des privés sans surveillance »

**Ils ne sont pas publiés** : les afficher laisserait entendre une participation
de l'agence qui n'est pas démontrée.

**Comment publier une vraie intervention :** ajouter une entrée dans le tableau
`apparitions`. La section « Médias » de la page d'accueil et la grille de la page
`/medias/` apparaissent alors automatiquement. Tant que le tableau est vide, la
page reste complète et cohérente : elle présente le contact presse et ce que
l'agence peut ou ne peut pas commenter.

→ **Fichier :** `src/content/medias.ts`.

### 3.3 Photographies

Aucune photographie de l'agence, de ses locaux ou de ses agents n'a pu être
récupérée. La direction artistique est donc **entièrement graphique et
tridimensionnelle** : aucune photo de personne n'est utilisée, et rien n'est
présenté comme un agent ADIMEN.

Si de vraies photographies sont fournies, elles s'intègrent sans refonte : elles
viendront enrichir les pages locales et la page agence.

### 3.4 Textes juridiques

`/politique-de-confidentialite/` et `/gestion-des-cookies/` ont été rédigées sur
la base du cadre suisse (loi fédérale sur la protection des données). Les
versions existantes n'ayant pas pu être lues, **elles doivent être relues par le
responsable du traitement** avant publication, en particulier les durées de
conservation annoncées.

---

## 4. Décision de périmètre : la version anglaise

Le site actuel comporte une section `/en/` **incomplète et non traduite** : les
titres et une partie des contenus y sont restés en français, avec un préfixe
technique « EN- » visible dans les balises `<title>`.

**Choix retenu :** la refonte est livrée **en français uniquement**. Toutes les URL
`/en/…` sont redirigées en 301 vers leur équivalent français, ou vers l'accueil.

L'architecture est prête pour une réouverture : aucune chaîne de caractères n'est
codée en dur dans les composants, tout le contenu vit dans `src/content/`. Une
traduction professionnelle est nécessaire avant de rouvrir la section.

---

## 5. Configuration technique à faire

### 5.1 Envoi du formulaire de contact

Le formulaire est fonctionnel, mais **aucune clé n'a été inventée**. Tant que les
variables ne sont pas renseignées, `/api/contact` répond `503` et le formulaire
bascule proprement sur le logiciel de messagerie du visiteur, la demande
préremplie.

| Variable | Rôle |
|---|---|
| `RESEND_API_KEY` | Clé d'API du service d'envoi |
| `CONTACT_FROM` | Expéditeur, sur un domaine vérifié chez le prestataire |
| `CONTACT_TO` | Adresse de réception (à défaut : `info@agence-adimen.ch`) |

→ **Fichier :** `.env.example`, et le tableau de bord de l'hébergeur.

### 5.2 Vérification des redirections après bascule

Les 22 redirections 301 des anciennes URL sont déclarées dans
`next.config.ts` et ont été testées une à une. **Après la bascule DNS**, les
revérifier en production, puis surveiller la Search Console pendant quelques
semaines : c'est là qu'apparaîtraient d'éventuelles URL indexées que l'audit
n'aurait pas vues, le crawl direct n'ayant pas été possible.

Si de telles URL apparaissent, il suffit d'ajouter une ligne au tableau
`anciennesUrl` en tête de `next.config.ts`.

---

## 6. Récapitulatif

| # | Point | Gravité | Fichier |
|---|---|---|---|
| 1.1 | Les Acacias ou Carouge | Bloquant | `src/content/site.ts` |
| 1.2 | Raison sociale et IDE | Bloquant | `src/content/site.ts` |
| 1.3 | Hébergeur | Bloquant | `src/app/mentions-legales/page.tsx` |
| 2.1 | Horaires du samedi | À trancher | `src/content/site.ts` |
| 2.2 | Deux ou quatre bureaux | À confirmer | `src/content/site.ts` |
| 3.1 | Téléphone de Montreux | Manquant | `src/content/site.ts` |
| 3.2 | Reportages RTS | Manquant | `src/content/medias.ts` |
| 3.3 | Photographies | Facultatif | — |
| 3.4 | Relecture juridique | À faire | pages légales |
| 4 | Version anglaise | Décision prise | `next.config.ts` |
| 5.1 | Clés d'envoi | À configurer | variables d'environnement |
| 5.2 | Suivi des redirections | Après bascule | `next.config.ts` |
