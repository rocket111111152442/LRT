# Sécurité — Neho Redesign (concept)

- **Aucun secret dans le dépôt.** Toutes les clés (envoi d'e-mail,
  anti-spam, cartographie, futur moteur d'estimation) passent par des
  variables d'environnement, voir `.env.example`.
- **Validation double** : chaque formulaire est validé côté client (retour
  immédiat, accessible) et re-validé côté serveur avec les mêmes schémas
  Zod (`src/lib/validations`) — le client n'est jamais source de vérité.
- **Anti-spam** : champ honeypot invisible + délai minimal de soumission
  sur les formulaires publics (`src/lib/forms/anti-spam.ts`).
- **Limitation de requêtes** : limiteur en mémoire par IP sur les routes
  API de formulaire (`src/lib/rate-limit.ts`) — à remplacer par un store
  partagé (Redis/Upstash) en production multi-instance.
- **En-têtes de sécurité** : CSP stricte, HSTS, `X-Frame-Options: DENY`,
  `Referrer-Policy`, `Permissions-Policy` (voir `next.config.ts` et
  `vercel.json`).
- **Aucune fausse confirmation** : un message de succès n'apparaît que
  lorsque la route API a effectivement accepté et journalisé la demande
  (voir `src/app/api/contact/route.ts`, `src/app/api/estimation/route.ts`).
- **Données personnelles** : minimisation des champs collectés,
  mention claire de la base légale et des droits (nLPD suisse + RGPD)
  sur `/confidentialite`, pas de traceur tiers par défaut.

Pour signaler une vulnérabilité sur ce concept de démonstration, contacter
le porteur du dépôt via les canaux internes habituels (voir `README.md`
racine du dépôt LRT).
