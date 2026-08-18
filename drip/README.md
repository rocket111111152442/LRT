# NATURAL BRUTAL

Boutique en ligne complète pour **NATURAL BRUTAL**, marque de vêtements de
combat et de sport : catalogue, panier, comptes clients, avis vérifiés,
paiement Stripe, fabrication Printify et back-office d'administration.

Application Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Prisma /
PostgreSQL. Elle vit dans le dossier `drip/` du dépôt (nom historique du
dossier), indépendamment de l'application Qoravo présente à la racine.

---

## Démarrage rapide

```bash
cd drip
npm install
cp .env.example .env      # puis remplir DATABASE_URL et AUTH_SECRET
npm run prisma:push       # crée les tables
npm run prisma:seed       # compte admin + rayons + pièces de démonstration
npm run dev
```

La boutique tourne sur http://localhost:3000, l'administration sur
http://localhost:3000/admin.

Générer `AUTH_SECRET` :

```bash
openssl rand -base64 48
```

---

## Ce que fait le site

**Boutique**

- Page d'accueil éditoriale, catalogue filtrable par rayon et par tri
- Fiche produit : galerie, sélecteur de coloris et de taille, accordéon
  matière / livraison / retours, avis, suggestions
- Panier persistant (tiroir latéral + page dédiée), fusionné avec le compte à la
  connexion
- Codes promo, seuil de livraison offerte, calcul des frais de port

**Comptes clients**

- Inscription, connexion, mot de passe oublié, changement de mot de passe
- Historique des commandes avec suivi visuel en quatre étapes
- Carnet d'adresses, favoris, paramètres et export RGPD

**Avis**

- Réservés aux acheteurs : le dépôt vérifie qu'une commande payée contient bien
  le produit
- Modération obligatoire avant publication, réponse publique de la boutique
- Note moyenne agrégée, répartition par étoile, fresque défilante en accueil

**Administration** (`/admin`, réservée au rôle `ADMIN`)

- Tableau de bord : chiffre d'affaires, commandes à traiter, alertes de
  configuration
- Commandes : statut, numéro de suivi, renvoi manuel vers Printify
- Produits : fiche complète, visuels, variantes, mise en ligne, rayons
- Avis : modération et réponses
- Clients, codes promo, messages du formulaire de contact

---

## Paiement Stripe

Le tunnel utilise **Stripe Checkout** : le client est redirigé vers une page
hébergée par Stripe, donc aucune donnée bancaire ne transite par ce serveur ni
n'y est stockée.

1. Renseigner `STRIPE_SECRET_KEY` (clés de test `sk_test_…` pour commencer).
2. Créer un webhook dans Stripe > Développeurs > Webhooks, pointant vers
   `https://votre-domaine/api/stripe/webhook`, et copier sa clé dans
   `STRIPE_WEBHOOK_SECRET`.
3. Événements à écouter : `checkout.session.completed`,
   `checkout.session.async_payment_succeeded`,
   `checkout.session.async_payment_failed`, `checkout.session.expired`,
   `charge.refunded`.

Les montants envoyés à Stripe sont recalculés côté serveur depuis la base : un
panier modifié dans le navigateur ne change pas la somme débitée.

En local, pour tester le webhook :

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

La page de confirmation revérifie elle aussi le paiement auprès de Stripe : une
commande est donc confirmée même si le webhook tarde ou n'est pas encore
configuré.

---

## Où va l'argent

C'est la question qui revient toujours, et la réponse n'est pas celle qu'on
imagine : **il n'y a pas de partage automatique du paiement.** Stripe ne reverse
rien à Printify. Le circuit réel est le suivant.

1. Le client paie sur Stripe Checkout. **La totalité** arrive sur le compte
   Stripe de la boutique — prix de l'article, frais de port compris.
2. Stripe prélève sa commission (environ 1,5 % + 0,25 € sur une carte
   européenne) et vire le reste sur le compte bancaire relié, selon le rythme
   de versement configuré dans Stripe.
3. Le webhook `checkout.session.completed` marque la commande payée et
   l'envoie aussitôt à Printify, qui la lance en production.
4. **Printify facture séparément** la fabrication et l'expédition, sur le moyen
   de paiement enregistré dans le compte Printify. C'est une dépense, pas une
   retenue sur l'encaissement.

La marge est donc la différence entre ce qui entre et ce qui sort :

```
marge = prix de vente − commission Stripe − (fabrication + port facturés par Printify)
```

L'API Printify renvoie les deux nombres pour chaque variante : `price` (le prix
de vente affiché) et `cost` (ce que Printify facture). Il faut vérifier que le
premier couvre le second, la commission Stripe et les frais de port réellement
appliqués — sinon une vente fait perdre de l'argent.

**À faire avant la première vente réelle :** enregistrer un moyen de paiement
valide dans Printify. Sans lui, la commande est créée mais reste bloquée avant
production, et le client aura payé sans rien recevoir.

Ce qui est automatique : l'encaissement, la création de la commande chez
Printify, le lancement en fabrication, le passage du statut à « en production ».
Ce qui ne l'est pas : le réglage de Printify, qui reste une facture à part.

---

## Fabrication Printify

1. Créer un jeton dans Printify > **My profile > Connections** > *Generate token*.
2. Le renseigner dans `PRINTIFY_API_KEY` (et `PRINTIFY_SHOP_ID` si le compte
   gère plusieurs boutiques).
3. Lancer l'import : bouton « Synchroniser Printify » dans `/admin/produits`, ou

```bash
npm run printify:sync
```

L'import crée les produits, leurs variantes et leurs mockups. **Les nouvelles
pièces arrivent hors ligne** : on rédige la fiche dans l'administration, puis on
publie. Les produits retirés de Printify sont désactivés, jamais supprimés, pour
préserver l'historique des commandes.

Après un paiement confirmé, la commande est transmise automatiquement à Printify.
Mettre `PRINTIFY_AUTO_PRODUCTION="false"` pour la créer en brouillon et lancer la
production à la main pendant le lancement.

---

## Visuels

Tant qu'un produit n'a pas d'image, une silhouette de maillot dessinée en SVG
occupe la place : la grille garde son rythme, rien ne paraît cassé.

Pour ajouter des visuels : `/admin/produits/[id]` > **Visuels** > coller une URL
`https` (Printify, Vercel Blob, Cloudinary…). Les mockups Printify sont importés
automatiquement à la synchronisation.

**Le logo** est pour l'instant composé en typographie dans
`src/components/Logo.tsx` : « NATURAL » lettré large au-dessus de « BRUTAL »
massif, comme le lockup dessiné. Pour passer au logo illustré (panthère et
feuillage), déposer les deux déclinaisons dans `public/` puis basculer la
constante `USE_IMAGE` du fichier à `true` :

```text
public/logo-clair.png    version foncée, pour les fonds papier
public/logo-sombre.png   version claire, pour les fonds noirs
```

Deux fichiers sont nécessaires : un dessin ne s'inverse pas tout seul comme le
fait une composition typographique.

---

## Direction artistique

Monochrome, défini dans `src/app/globals.css` :

- Encre `#0b0b0b`, papier `#f4f2ed` — jamais de noir ni de blanc purs, ce qui
  donne un rendu imprimé plutôt qu'un aplat d'écran
- Titres en Anton, textes en Inter Tight, étiquettes et prix en JetBrains Mono
- Angles droits, filets de 1px comme structure, voile de grain sur toute la page
- Animations : apparition au défilement, bandeaux défilants, tiroir de panier,
  remplissage des boutons — toutes désactivées si le système demande
  « animations réduites »

---

## Sécurité

- Mots de passe hachés avec bcrypt (12 tours)
- Sessions signées en HMAC-SHA256, cookie `httpOnly` préfixé `__Host-`,
  invalidées à tout changement de mot de passe
- Contrôle d'origine sur toutes les requêtes mutantes (`middleware.ts`), webhook
  Stripe excepté car authentifié par signature
- Limitation de débit sur connexion, inscription, contact, newsletter, panier et
  codes promo
- Toutes les écritures filtrent sur l'identifiant du propriétaire : impossible de
  modifier le panier, l'adresse ou la commande d'un autre compte
- En-têtes HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Permissions-Policy`
- Validation systématique des entrées avec zod

---

## Conformité

Pages fournies : CGV, mentions légales, politique de confidentialité (RGPD),
cookies, livraison et retours, FAQ.

**À compléter avant l'ouverture** — ces mentions sont légalement obligatoires en
France et un encart rouge s'affiche sur les pages légales tant qu'elles manquent :

```
NEXT_PUBLIC_SHOP_ADDRESS   adresse du siège
NEXT_PUBLIC_SHOP_SIRET     numéro SIRET / RCS
NEXT_PUBLIC_SHOP_EMAIL     adresse de contact réelle
```

Aucun cookie publicitaire n'est déposé : seuls la session et le panier, dispensés
de consentement. Si un outil de mesure d'audience est ajouté plus tard, il faudra
mettre en place une bannière et mettre à jour `/cookies`.

---

## Déploiement sur Vercel

1. Importer le dépôt et régler **Root Directory** sur `drip`.
2. Ajouter une base Postgres (Storage > Supabase, ou tout autre fournisseur).
   L'intégration pose `POSTGRES_PRISMA_URL` / `POSTGRES_URL` ; l'application
   les accepte telles quelles, il n'y a pas de `DATABASE_URL` à recopier.
3. Renseigner les variables d'environnement (voir `.env.example`).
4. Après le premier déploiement, créer les tables et le compte admin :

```bash
npx vercel env pull .env.production.local
DATABASE_URL="…" npx prisma db push
DATABASE_URL="…" ADMIN_EMAIL="…" ADMIN_PASSWORD="…" npm run prisma:seed
```

### Les deux variables sans lesquelles rien ne s'enregistre

| Variable | Sans elle |
| --- | --- |
| `DATABASE_URL` | aucun compte, aucune commande, aucun avis ne peut être écrit |
| `AUTH_SECRET` | impossible de signer une session : personne ne reste connecté (48 caractères aléatoires, `openssl rand -base64 48`) |

Tant qu'elles manquent, le site reste **consultable** — le catalogue se replie
sur un état vide plutôt que de renvoyer une erreur 500 — mais les écrans de
compte affichent un bandeau « comptes en cours d'ouverture » et les
formulaires répondent que rien n'a été enregistré, au lieu de tomber sur la
page d'incident. Le journal du serveur nomme précisément la variable absente.

Dès que les deux variables sont posées et les tables créées, le bandeau
disparaît de lui-même : aucun code à modifier.

---

## Scripts

| Commande | Effet |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run lint` | ESLint |
| `npm run prisma:push` | Applique le schéma à la base |
| `npm run prisma:migrate` | Crée une migration |
| `npm run prisma:seed` | Admin + rayons + pièces de démonstration |
| `npm run printify:sync` | Importe le catalogue Printify |
