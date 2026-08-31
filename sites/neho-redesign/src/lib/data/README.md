# Couche de données — comment brancher une vraie source

Tous les fichiers de ce dossier (`cantons.ts`, `communes.ts`, `agents.ts`,
`properties.ts`, `testimonials.ts`, `faq.ts`) exportent des tableaux
TypeScript **statiques et fictifs**, plus des fonctions d'accès
(`getPropertyBySlug`, `getCommunesByCanton`, etc.). Chaque page importe ces
fonctions plutôt que les tableaux bruts.

C'est volontaire : pour brancher une vraie API ou un CRM, il suffit de
remplacer le **corps** de ces fonctions par un appel réseau (`fetch`,
client Prisma, SDK d'un CRM immobilier…) sans toucher aux composants qui
les consomment, tant que la forme des types (`src/lib/data/types.ts`) est
respectée.

## Étapes pour connecter une vraie source

1. Définir `REAL_ESTATE_API_URL` et `REAL_ESTATE_API_KEY` dans les
   variables d'environnement (voir `.env.example`).
2. Créer `src/lib/data/client.ts` avec un client `fetch` typé (server-only)
   qui appelle cette API.
3. Remplacer progressivement chaque fonction de ce dossier :
   - `getFeaturedProperties`, `getPropertyBySlug`, `getPropertiesByCommune`,
     `getPropertiesByCanton`, `getSimilarProperties` → recherche/portails.
   - `getCantonBySlug`, `getCommunesByCanton`, `getCommuneBySlug` →
     référentiel géographique (à envisager avec génération incrémentale de
     pages statiques `generateStaticParams` + `revalidate`, plutôt qu'un
     export intégral de milliers de pages).
   - `getAgentBySlug`, `getAgentsByCanton` → annuaire des courtiers (RH/CRM).
   - `testimonials.ts` → export vérifié depuis Trustpilot ou un CRM d'avis.
4. Le moteur d'estimation réel (actuellement une simple confirmation de
   demande, voir `src/app/api/estimation/route.ts`) doit être branché ici
   également : ne jamais afficher un chiffre calculé côté client comme une
   estimation réelle sans un vrai moteur validé métier.
5. Mettre à jour `src/config/site-numbers.ts` : chaque statistique doit
   provenir de la même source que les données affichées, avec
   `verified: true` uniquement après vérification humaine.

## Pourquoi un petit jeu de données ici

Le site réel couvre des dizaines de milliers de biens et de pages locales
(voir `docs/neho-audit.md` §12). Reproduire ce volume dans une démonstration
serait à la fois inutile et risqué (données non vérifiées présentées comme
réelles). Ce dossier contient donc un échantillon volontairement restreint
(6 cantons, 3 communes par canton, ~14 biens, 9 agents, 8 témoignages),
suffisant pour démontrer que l'architecture de gabarits fonctionne, sans
jamais prétendre représenter l'inventaire réel de Neho.
