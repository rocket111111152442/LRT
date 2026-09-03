# Lullin Web

Site vitrine statique (HTML/CSS/JS, sans framework) pour Lullin Web — création de
sites internet et maintenance pour entreprises. Formulaire d'inscription/devis
géré par une fonction serverless Vercel qui envoie l'e-mail via Resend.

## Structure

```
index.html              page principale (hero, services, méthode, réalisations, offres, formulaire)
mentions-legales.html    mentions légales (à compléter avant mise en ligne réelle)
assets/css/style.css     thème noir & blanc, animations (scroll reveal, particules, curseur)
assets/js/main.js        interactions (menu, curseur, magnétisme, reveal, formulaire)
api/devis.js             fonction serverless : envoi du formulaire par e-mail (Resend)
vercel.json              en-têtes de sécurité et cache
robots.txt / sitemap.xml référencement
```

## Déploiement sur Vercel

1. Importer ce dossier (`sites/lullin-web`) comme Root Directory du projet Vercel.
2. Aucun build nécessaire (site statique + fonctions serverless Node).
3. Renseigner dans Vercel → Settings → Environment Variables :
   - `RESEND_API_KEY` — clé d'API [Resend](https://resend.com)
   - `CONTACT_FROM` — expéditeur vérifié, ex. `devis@lullinweb.fr`
   - `CONTACT_TO` — adresse qui reçoit les demandes de devis
4. Tant que ces variables ne sont pas configurées, le formulaire répond
   poliment en invitant à écrire directement par e-mail (pas d'erreur brute).

## Avant mise en ligne réelle

- Compléter `mentions-legales.html` avec les informations légales exactes
  (forme juridique, SIREN/SIRET, adresse).
- Remplacer les visuels placeholder de la section « Réalisations » par de
  vrais projets au fur et à mesure.
- Vérifier la disponibilité réelle du nom de domaine `lullinweb.fr` auprès
  d'un registrar (OVH, Gandi…) avant achat.
