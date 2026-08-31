# Audit de neho.ch — préparation du concept de refonte

**Statut :** audit réalisé le 31/08/2026, à distance, avec un accès réseau limité.
**Portée :** ce document sert de base à un concept de refonte privé (`sites/neho-redesign`).
Il ne doit pas être diffusé comme une fiche officielle sur Neho SA.

## 0. Méthodologie et limite importante

L'environnement d'exécution utilisé pour cette mission bloque l'accès direct
(`WebFetch`) au domaine `neho.ch` (proxy de sortie réseau restreint : erreur
`EGRESS_BLOCKED`). Il n'a donc **pas été possible de naviguer directement sur
le site ni d'inspecter son HTML/JSON-LD**. Un premier agent d'audit en
tâche de fond a également échoué (limite de session atteinte).

L'audit ci-dessous a été reconstitué via une dizaine de recherches web
ciblées (extraits d'indexation, titres de pages, méta-descriptions cités par
le moteur de recherche). C'est une base **sérieuse mais partielle** :
- Les URLs, intitulés de pages, cantons couverts, langues, structure de
  l'offre et statistiques citées ci-dessous proviennent de résultats de
  recherche réels et sont sourcés page par page.
- Les tarifs des formules **Essential / Serenity / Privilege** (CHF 12'000,
  14'500 et 25'000 HT) et le détail prestation-par-prestation figurant dans
  la commande de ce projet n'ont **pas pu être vérifiés indépendamment**
  dans cet environnement : aucune page indexée ne les confirme sous ces
  noms exacts. Seul le prix plancher « dès CHF 12'000 » est confirmé par
  plusieurs pages indépendantes.
- **Avant toute présentation à un tiers ou mise en production**, quelqu'un
  ayant un accès réseau normal doit ouvrir neho.ch/fr/our-offer et
  neho.ch/fr/agence-immobiliere et confirmer noms de formules, prix exacts
  (HT/TTC), prestations incluses et chiffres d'entreprise en vigueur à la
  date de vérification. Le concept a été construit pour que ces valeurs se
  mettent à jour depuis un seul fichier de configuration
  (`src/config/site-numbers.ts`), justement pour rendre cette vérification
  rapide.

Toute donnée non confirmée est explicitement marquée **« à vérifier »**
dans ce document, dans le code (constante `VERIFIED: false` ou commentaire
`// TODO VERIFY`) et, quand elle est visible par l'utilisateur, par une
mention discrète « démonstration » ou une note de bas de page sur le site
recréé.

## 1. Résumé exécutif

Neho est une **agence immobilière suisse en ligne fondée en décembre 2017 à
l'EPFL** par Eric Corradin (CEO), Steve Savioz (CMO), Florent Bourachot
(CFO) et Guillaume Dubray. Positionnement : première agence immobilière
« au forfait fixe » de Suisse — le vendeur paie un montant forfaitaire
convenu à l'avance plutôt qu'une commission proportionnelle au prix de
vente, avec un accompagnement par un courtier local combiné à des outils
numériques (estimation en ligne, visite virtuelle 360°, plans, portail de
diffusion). L'entreprise a par la suite racheté **acheteur.ch**, une
start-up romande spécialisée côté acheteurs.

- **Langues confirmées :** français (`/fr/`), allemand (`/de/`), anglais
  (`/en/`). Aucune page italienne n'a été retrouvée dans les recherches
  (Suisse romande + Suisse alémanique en priorité) — **à vérifier**.
- **Zone de couverture confirmée :** Suisse romande — cantons de Genève,
  Vaud, Fribourg, Valais, Neuchâtel, Jura — avec une extension en Suisse
  alémanique repérée sur des villes/cantons germanophones (Uster,
  Winterthour, Thoune, Berne, Lenzbourg, canton de Berne). L'ampleur exacte
  de la couverture alémanique est **à vérifier**.
- **Ampleur du site :** très grand nombre de pages générées
  programmatiquement (pages par canton, par ville/commune, par type de bien
  « appartements à vendre à Genève », etc. — un résultat mentionne
  « 2974 appartements » indexés pour le seul canton de Vaud), plus un blog
  fourni, des fiches de biens individuelles, une section Neho Pro
  (`pro.neho.ch`) dédiée aux professionnels. Une refonte ne doit donc
  **jamais** tenter de dupliquer ce volume : voir §12.

## 2. Inventaire des pages et rubriques (sourcé)

| Page / rubrique | URL observée | Objectif |
|---|---|---|
| Accueil FR | `neho.ch/fr` | Vitrine, accroche « agence immobilière locale au forfait fixe » |
| Accueil DE | `neho.ch/de` | Équivalent allemand |
| Notre offre FR | `neho.ch/fr/our-offer` | Détail du forfait fixe, promesse « vendre sans commission » |
| Notre offre DE | `neho.ch/de/our-offer` | Équivalent allemand |
| Notre offre EN | `neho.ch/en/our-offer` | Équivalent anglais |
| À propos DE | `neho.ch/de/about` | Présentation de l'entreprise |
| Vendre | `neho.ch/fr/vendre-bien-immobilier` | Parcours vendeur |
| Acheter | `neho.ch/fr/achat-appartement-maison` | Parcours acheteur |
| Estimation en ligne | `neho.ch/fr/estimation-bien-immobilier` | Formulaire d'estimation gratuite « en 4 minutes » |
| Estimation (étape bien) | `neho.ch/fr/properties/book-free-evaluation?step=property-type` | Étape du tunnel d'estimation (paramètre `step`) |
| FAQ estimation | `neho.ch/fr/faq/l-evaluation-1` | Question fréquente sur l'évaluation |
| Capacité d'achat | `neho.ch/fr/calcul-capacite-achat-immobilier` | Calculateur de capacité d'achat |
| Biens à vendre (listing) | `neho.ch/fr/immobilier` et `neho.ch/fr/our-properties` | Catalogue de biens |
| Biens filtrés par type/lieu | `neho.ch/fr/a-vendre/appartements/municipalite/geneve`, `neho.ch/fr/a-vendre/appartements/canton/vaud` | Pages de recherche pré-filtrées, programmatiques |
| Promotions immobilières | `neho.ch/fr/promotion-immobiliere` | Programmes neufs |
| Agence par canton | `neho.ch/fr/agence-immobiliere-vaud-canton`, `.../agence-immobiliere-valais-canton`, `.../agence-immobiliere-geneve` | Pages locales cantonales, SEO local |
| Courtier par ville | `neho.ch/fr/courtier-immobilier-neuchatel`, `.../courtier-immobilier-le-chable-vs-1934-0` | Pages locales communales, SEO local |
| Immobilienmakler (DE) | `neho.ch/de/immobilienmakler-uster`, `-winterthur`, `-thun`, `-bern`, `-bern-kanton`, `-lenzburg` | Équivalent alémanique des pages locales |
| Estimation locale | `neho.ch/fr/estimation-immobiliere-fribourg` | Page d'estimation dédiée à une région |
| Témoignages | `neho.ch/fr/testimonials` | Avis clients vérifiés |
| Contact | `neho.ch/fr/contact` | Formulaire de contact |
| Blog (accueil + articles) | `neho.ch/fr/blog/...` (ex. `agent-immobilier-prix`, `capacite-achat-immobilier`, `liste-des-agences-immobilieres`, `meilleure-agence-immobiliere-pully`, `courtier-immobilier-neuchatel`, `estimation-bien-immobilier-gratuite-en-ligne-sans-inscription`, `site-pour-estimer-un-bien-immobilier`, `expertise-immobiliere-vaud-geneve-fribourg-neuchatel-valais-jura`) | Contenu éditorial, longue traîne SEO |
| Neho Pro | `pro.neho.ch/fr` | Offre dédiée aux courtiers professionnels indépendants, sous-domaine séparé |
| Connexion / espace client | `neho.ch/fr/login-form` | Espace compte |
| Conditions d'utilisation | `neho.ch/fr/conditions-utilisation` | Page légale |
| Politique de cookies | `neho.ch/fr/infos-cookies` | Gestion des cookies |
| Politique de confidentialité | référencée depuis les pages légales (URL exacte non confirmée) | RGPD / nLPD |

**Non trouvées dans les recherches (à vérifier directement) :** page « mentions
légales » au sens strict / impressum, page fiche de bien individuelle
(URL type), page équipe globale (« notre équipe », par opposition aux pages
locales par ville), sitemap.xml, page italienne.

## 3. Fonctionnalités identifiées

- **Estimation immobilière en ligne** : tunnel « gratuite en 4 minutes »,
  sans inscription, avec paramètre d'étape observable dans l'URL
  (`?step=property-type`) — confirme un formulaire multi-étapes.
- **Calculateur de capacité d'achat** (financement acheteur), avec un
  partenaire de financement cité : **Strike** (première consultation
  gratuite).
- **Recherche de biens avancée** : filtres par type de bien, ville/code
  postal/quartier, nombre de pièces ; **dessin de zone sur carte** ;
  **recherche par temps de trajet** ; **alertes personnalisées** ; accès en
  « avant-première » à certains biens 3 jours avant leur publication sur
  les autres portails.
- **Pages de biens** avec visites virtuelles, plans, photos professionnelles
  (détail exact de la fiche non confirmé faute d'accès direct).
- **Agrégation de biens** au-delà du seul portefeuille Neho (les volumes
  affichés par ville/canton, ex. « 2974 appartements » dans le canton de
  Vaud, suggèrent un affichage combiné avec d'autres sources/portails —
  **à vérifier**, car cela ne doit surtout pas être reproduit tel quel dans
  la démo : voir §12).
- **Espace de connexion / compte client** (`login-form`).
- **Neho Pro** : offre B2B pour courtiers indépendants, forfait mentionné
  « dès CHF 12'000 » également (source secondaire, à vérifier).

## 4. Offres et tarifs

### Ce qui est confirmé par plusieurs sources indépendantes

- Le modèle est un **forfait fixe** annoncé **« dès CHF 12'000 »** sur de
  nombreuses pages locales (Vaud, Valais, Genève, Neuchâtel, Le Châble VS).
- Le forfait **varie selon la région/le bien** : une page tierce cite un
  forfait démarrant à **CHF 9'500** pour Pully, ce qui confirme qu'il ne
  s'agit pas d'un prix unique national mais d'un prix « à partir de »,
  ajusté localement.
- Une page tierce évoque un ancien palier « CHF 7'500 (dont CHF 3'000 de
  frais et CHF 4'500 au succès de la vente) » — potentiellement une
  structure antérieure ou un cas particulier ; **non confirmé comme
  tarif actuel**, à ne pas réutiliser sans vérification.
- Un contenu de blog évoque une **économie moyenne de CHF 25'000** pour
  les vendeurs à Neuchâtel — **ceci correspond probablement au chiffre
  d'« économie moyenne » et non à un prix de formule « Privilege » à
  CHF 25'000** comme indiqué dans la commande initiale de ce projet. C'est
  une incohérence potentielle importante (voir §6) : les deux chiffres
  circulent dans des contextes différents et ne doivent pas être confondus
  sans confirmation.

### Ce qui n'est PAS confirmé

- Les noms de formules **Essential / Serenity / Privilege** n'apparaissent
  dans aucun résultat de recherche indexé au moment de l'audit.
- Les prix précis **CHF 12'000 HT / 14'500 HT / 25'000 HT** par formule,
  ainsi que la répartition exacte des prestations par palier (photos HD,
  visite 360°, plans laser, drone/vidéo, diffusion internationale, conseil
  juridique/fiscal, etc.) n'ont pas pu être vérifiés.

**Décision retenue pour le concept :** afin de respecter la demande initiale
tout en restant honnête sur le niveau de preuve, le comparatif de la
refonte reprend la structure à trois formules **Essential / Serenity /
Privilege** avec les prix CHF 12'000 / 14'500 / 25'000 HT fournis dans la
commande (le premier palier est cohérent avec le « dès CHF 12'000 »
confirmé indépendamment), mais **chaque prix et chaque case du tableau
comparatif porte une note « à confirmer sur neho.ch »**, et le fichier
`src/config/site-numbers.ts` centralise ces valeurs avec un indicateur
`verified: false` pour qu'elles soient corrigées en un seul endroit dès
qu'un accès direct au site sera possible.

## 5. Chiffres clés de l'entreprise (avec source)

| Chiffre | Valeur trouvée | Source / contexte | Statut |
|---|---|---|---|
| Avis Trustpilot | 2 018 avis référencés (pagination Trustpilot ~39-42 pages) | trustpilot.com/review/neho.ch | confirmé (tiers, pas neho.ch) |
| Note moyenne | 4,7/5 | Extrait indexé mentionnant « plus de 500 clients recommandent Neho » et 4,7/5 | à confirmer sur la page /fr/testimonials |
| Clients recommandant | « plus de 500 » | idem | à confirmer |
| Économie moyenne (Neuchâtel) | CHF 25'000 | titre de page blog « Courtiers immobiliers à Neuchâtel — Économisez en moyenne CHF 25'000 » | à confirmer, localisé à Neuchâtel, pas forcément national |
| Forfait plancher | dès CHF 12'000 | répété sur de nombreuses pages locales (Vaud, Valais, Genève, Neuchâtel) | confirmé (répété), mais date de dernière mise à jour inconnue |
| Forfait local le plus bas observé | CHF 9'500 (Pully) | page tierce comparative | à confirmer |
| Cantons couverts | Genève, Vaud, Fribourg, Valais, Neuchâtel, Jura (+ présence alémanique : Berne et villes associées) | titres de pages locales et blog « expertise immobilière Vaud Genève Fribourg Neuchâtel Valais Jura » | confirmé pour la Suisse romande ; étendue exacte en Suisse alémanique à confirmer |
| Fondation | décembre 2017, à l'EPFL | pme.ch, monde-economique.ch | confirmé (sources presse) |
| Fondateurs | Eric Corradin (CEO), Steve Savioz (CMO), Florent Bourachot (CFO), Guillaume Dubray | presse + profils publics | confirmé (sources tierces) |
| Acquisition | acheteur.ch | immo2.pro | confirmé (source presse spécialisée) |

## 6. Informations contradictoires ou à clarifier

1. **CHF 25'000** apparaît à la fois comme candidat « prix de la formule
   Privilege » (commande initiale) et comme **« économie moyenne réalisée
   par les vendeurs »** dans un contenu de blog. Il ne faut pas afficher ces
   deux usages sans les distinguer clairement — la refonte les traite comme
   deux chiffres différents et clairement légendés.
2. Le forfait plancher varie selon la source entre **CHF 9'500** (Pully,
   source tierce) et **CHF 12'000** (répété sur les pages officielles
   consultées) : cohérent avec un prix « dès », mais à confirmer que
   CHF 12'000 est bien le plancher actuel toutes régions confondues.
3. Un ancien palier à **CHF 7'500** apparaît dans un extrait ancien/tiers :
   possible tarif historique, à ne pas réutiliser.
4. Le volume de biens affiché par page locale (ex. « 2974 appartements »
   dans le canton de Vaud) semble supérieur à ce qu'une seule agence
   pourrait avoir en portefeuille propre — laisse penser à une agrégation
   multi-sources ou à un compteur incluant des biens déjà vendus/archivés.
   À clarifier avant toute reproduction du chiffre.
5. Couverture linguistique italienne : aucune page `/it/` trouvée alors que
   la Suisse compte une région italophone — à confirmer que Neho ne dessert
   pas le Tessin, plutôt que de supposer une simple absence de traduction.

## 7. Structure SEO observée

- URLs **localisées et lisibles**, un segment de langue en tête
  (`/fr/…`, `/de/…`, `/en/…`).
- Convention de titres `<h1>`/`<title>` orientée requêtes locales, ex. :
  *« Agence immobilière Genève — Forfait fixe dès CHF 12'000 | Neho »*,
  *« Votre courtier immobilier de Neuchâtel — Forfait fixe dès CHF 12'000
  | Neho »* — schéma répété et donc probablement généré par gabarit
  (canton/ville + promesse de prix + marque).
  → C'est exactement le patron « template dynamique + données locales »
  demandé au §9 de la commande : la refonte reproduit ce principe
  (génération depuis un fichier de données, pas des pages copiées à la
  main), sans dupliquer le texte.
- Contenu de blog à vocation de longue traîne SEO (« meilleure agence
  immobilière à Pully », « liste des agences immobilières de Suisse »,
  « prix d'un agent immobilier en Suisse »).
- Present sur des portails tiers (Homegate, acheter-louer.ch, justimmo.ch),
  cohérent avec une stratégie de diffusion multi-portails mentionnée dans
  l'offre.
- Sitemap.xml et balisage structuré (JSON-LD) **non observables** sans accès
  direct au HTML — à vérifier avant refonte finale (présence de
  `RealEstateAgent`, `Organization`, `Offer`, etc.).

## 8. Problèmes UX identifiés (sur la base des extraits disponibles)

- Multiplicité des points d'entrée pour l'estimation (`estimation-bien-immobilier`,
  `estimation-immobiliere-fribourg`, `properties/book-free-evaluation`, une
  FAQ dédiée « /faq/l-evaluation-1 ») : risque de parcours fragmenté ou de
  contenu dupliqué entre plusieurs variantes de la même intention.
- Grand nombre de pages locales à formulation quasi identique
  (« Agence immobilière [Canton] — Forfait fixe dès CHF 12'000 ») : bon
  pour le SEO local mais risque réel de contenu perçu comme dupliqué côté
  utilisateur si le corps de page ne varie pas suffisamment — c'est un
  point que la refonte doit corriger (voir §9 de la commande : « chaque
  page doit apporter une vraie information utile »).
- Existence d'un ancien palier tarifaire visible en indexation externe
  (CHF 7'500) suggère que d'anciens contenus/prix peuvent rester indexés
  ailleurs sur le web même après mise à jour côté site — point de vigilance
  pour la gestion des redirections 301 et du cache des moteurs.

## 9. Problèmes de responsive/mobile identifiés

Non observables sans rendu visuel du site (accès direct bloqué). **À
vérifier manuellement** avant refonte définitive : lisibilité des tableaux
de comparaison d'offres sur mobile, utilisabilité de la recherche par carte
et du dessin de zone au doigt, longueur des formulaires multi-étapes sur
petit écran.

## 10. Éléments essentiels à conserver dans la refonte

- La promesse centrale : **forfait fixe transparent**, opposé à la
  commission proportionnelle traditionnelle — c'est l'identité de marque.
- L'**accompagnement par un agent/courtier local** dédié à chaque vente
  (humain + outils numériques, pas un pur self-service).
- L'**estimation en ligne gratuite et rapide** comme porte d'entrée
  principale du parcours vendeur.
- Le **calculateur de capacité d'achat** côté acheteur.
- La **couverture par canton/région** avec expertise locale mise en avant.
- Le principe de **pages locales générées depuis des données structurées**
  (canton → district → commune → agent), pas du contenu copié-collé.
- La diffusion multi-portails et les outils modernes (visite 360°, plans,
  photos pro) comme argument de différenciation.
- Le sérieux juridique suisse : mention explicite de la nLPD (loi fédérale
  sur la protection des données, révisée 2023) en plus du RGPD.

## 11. Éléments à moderniser dans le concept de refonte

- **Direction artistique** : remplacer un habillage « site vitrine
  standard » par une identité éditoriale plus haut de gamme (typographie
  éditoriale, grands aplats crème/anthracite, photographie affirmée),
  cf. brief créatif §4.
- **Différenciation du contenu local** : générer un vrai contenu utile par
  page (statistiques locales, FAQ locale, agents rattachés) plutôt que la
  répétition d'un même gabarit avec juste le nom de la ville qui change.
- **Clarification du tunnel d'estimation** : un seul parcours multi-étapes
  cohérent plutôt que plusieurs points d'entrée qui semblent se chevaucher.
- **Lisibilité du comparatif d'offres** : tableau clair formule × prestation,
  sans information cachée derrière une interaction.
- **Transparence sur les chiffres** : centraliser et dater les statistiques
  d'entreprise pour éviter les incohérences relevées au §6.
- **Accessibilité et performance** : appliquer WCAG 2.2 AA et de bons Core
  Web Vitals dès la conception (non vérifiable sur le site actuel depuis
  cet environnement, mais posé comme exigence de la refonte).

## 12. Ampleur du site — ce que la refonte NE fait PAS

Neho couvre des dizaines de villes/cantons et vraisemblablement des
milliers de fiches de biens (résultats de recherche évoquant des milliers
d'appartements par canton). Conformément à la commande :

- La refonte **ne copie aucune donnée réelle de biens ni aucune donnée
  personnelle**.
- Elle utilise un **petit jeu de données de démonstration** (quelques biens
  fictifs, quelques communes, quelques agents fictifs), clairement
  identifié comme tel partout où il apparaît.
- Elle construit une **architecture de gabarits data-driven** (cantons,
  communes, agents, biens) prête à être connectée à une vraie source de
  données ou API, documentée dans `src/lib/data/README.md`.
- Aucune fausse estimation immobilière n'est jamais affichée comme un
  résultat réel : le tunnel d'estimation de démonstration se termine par
  une confirmation de demande, pas par un chiffre inventé.

## 13. Récapitulatif des points « à confirmer avant toute diffusion »

- [ ] Noms exacts des formules commerciales actuelles et confirmation
      qu'il s'agit bien d'« Essential / Serenity / Privilege ».
- [ ] Prix exact de chaque formule (HT/TTC, devise, conditions) à la date
      de vérification.
- [ ] Détail prestation par prestation de chaque formule.
- [ ] Note moyenne et nombre d'avis affichés sur neho.ch/fr/testimonials
      (distinct des avis Trustpilot).
- [ ] Chiffre d'économie moyenne annoncé au niveau national (pas seulement
      Neuchâtel).
- [ ] Liste exacte et à jour des cantons/régions couverts, y compris la
      part alémanique et l'absence/présence du Tessin.
- [ ] Existence ou non d'une version italienne du site.
- [ ] URL et contenu exacts de la page « mentions légales » / impressum et
      raison sociale complète de l'entité éditrice.
- [ ] Présence et contenu du sitemap.xml et des données structurées
      (JSON-LD) réellement publiées.
- [ ] Nature exacte des volumes de biens affichés par page locale
      (portefeuille propre vs agrégation multi-portails).
