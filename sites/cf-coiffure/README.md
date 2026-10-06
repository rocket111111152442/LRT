# CF Coiffure — site vitrine + réservation en ligne

Site du salon **CF Coiffure** (Six-Fours-les-Plages), dans l'esprit de sa déco : garage américain
rétro (planches de bois, plaques d'immatriculation, rayures Martini, brique, tôle alu, néons).
HTML/CSS/JS sans framework + fonctions serverless Vercel. Seule dépendance : `@vercel/blob`.

## Pages

```
index.html              accueil (salon, carte, galerie, avis, horaires, plan)
reserver.html           assistant de réservation en 4 étapes
rdv.html                consulter / déplacer / annuler un rendez-vous (lien personnel)
admin.html              espace salon : agenda jour/semaine/liste, création, blocages, export CSV
mentions-legales.html
```

## Réservation — fonctionnement

- Prestations multiples (la durée s'additionne), choix du fauteuil ou « sans préférence »
  (attribution au fauteuil le moins chargé), créneaux calculés en temps réel par pas de 15 min.
- Anti double réservation : chaque quart d'heure occupé est un verrou créé sans écrasement
  possible ; si deux clients valident le même créneau en même temps, le second reçoit un 409.
- Le client reçoit un code (`CF-XXXXXX`) et un lien secret pour gérer son RDV : ajout à Google
  Agenda / fichier .ics, déplacement, annulation (jusqu'à 2 h avant, réglable).
- Espace salon (`/admin.html`, mot de passe = variable `ADMIN_PASSWORD`) : agenda par fauteuil,
  fiche client, statut honoré/absent, note interne, annulation, RDV saisis au téléphone,
  blocage de plages ou de journées (congés), export CSV, rafraîchissement auto chaque minute.
- E-mails (optionnels) : confirmation/annulation au client et notification au salon via Resend.

### Réglages : `api/_config.js`

Prestations, prix, durées, horaires, fauteuils, délais (préavis minimum, horizon de réservation,
délai d'annulation). **Les valeurs actuelles sont provisoires et doivent être validées par le
salon** : tarifs, durées, horaires (mar.–ven. 9h–19h, sam. 9h–18h supposés), noms des fauteuils
(« Route 66 », « Miami » — à remplacer par les prénoms des coiffeurs·ses), téléphone.

### Variables d'environnement (Vercel)

| Variable | Rôle |
|---|---|
| `BLOB_READ_WRITE_TOKEN` | stockage des RDV (Vercel Blob privé) — ajouté automatiquement |
| `ADMIN_PASSWORD` | mot de passe de l'espace salon |
| `RESEND_API_KEY`, `MAIL_FROM` | optionnel : envoi des e-mails (expéditeur vérifié chez Resend) |
| `SALON_EMAIL` | optionnel : adresse qui reçoit chaque nouvelle réservation |
| `SITE_URL` | optionnel : URL publique utilisée dans les e-mails (sinon déduite de la requête) |

## Développement

```sh
python3 _build/build.py   # régénère les pages depuis _build/pages (en-tête/pied communs)
```

Sans `BLOB_READ_WRITE_TOKEN`, l'API écrit dans `.data/` (pratique pour tester en local).

## À compléter avant mise en service réelle

- Téléphone (`SALON.phone` dans `api/_config.js`), SIRET et responsable dans les mentions légales.
- Vérifier l'adresse (« Imm. Le Beaugency, La Planche » provient d'un annuaire en ligne).
- Photos : actuellement recadrées depuis la fiche Google, en basse définition — à remplacer.
- Limite connue : Vercel Blob convient au volume d'un salon ; au-delà de quelques milliers de
  RDV par mois, migrer vers une base Postgres.
