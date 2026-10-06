# CF Coiffure — site vitrine + réservation en ligne

Site du salon **CF Coiffure** (Six-Fours-les-Plages), dans l'esprit de sa déco américaine
(planches de bois, plaques d'immatriculation, rayures Martini), volontairement sobre.
HTML/CSS/JS sans framework + fonctions serverless Vercel. Seule dépendance : `@vercel/blob`.

## Pages

```
index.html              accueil (salon, prestations, avis, horaires, plan)
reserver.html           réservation : jour, heure, nom, téléphone
rdv.html                consulter / annuler un rendez-vous (lien personnel)
admin.html              espace salon : agenda jour/semaine/liste, création, blocages, export CSV
mentions-legales.html
```

## Réservation — fonctionnement

- Le client choisit **un jour et une heure**, puis donne **son nom et son téléphone**. Rien d'autre.
- Chaque rendez-vous dure **35 minutes** ; les créneaux proposés s'enchaînent depuis l'ouverture
  (9h00, 9h35, 10h10…). Un créneau pris disparaît pour les autres.
- Anti double réservation : un document par jour, écrit seulement si personne ne l'a modifié
  entre-temps (ETag). Deux clients qui valident le même créneau au même instant : un seul passe.
- Après réservation : récapitulatif, ajout à l'agenda, lien pour annuler (jusqu'à 2 h avant).
- Espace salon (`/admin.html`, mot de passe = `ADMIN_PASSWORD`) : agenda jour / semaine / liste,
  fiche client (appel en un clic, venu / pas venu, note interne, annulation), saisie d'un rendez-vous
  pris par téléphone **avec la durée voulue** (couleur, mèches…), blocage de créneaux ou de congés,
  export CSV.

### Réglages : `api/_config.js`

Horaires, durée d'un rendez-vous (`BOOKING.duration`), délais, liste des prestations affichée sur
l'accueil, nombre de postes (`STAFF`). **Valeurs à faire valider par le salon** : horaires
(mar.–ven. 9h–19h, sam. 9h–18h supposés) et téléphone.

Avec un seul poste dans `STAFF`, un seul client par créneau. Si deux personnes coiffent en même
temps, ajouter un second poste : deux clients pourront réserver la même heure.

### Variables d'environnement (Vercel)

| Variable | Rôle |
|---|---|
| `BLOB_READ_WRITE_TOKEN` | stockage des RDV (Vercel Blob privé) — ajouté automatiquement |
| `ADMIN_PASSWORD` | mot de passe de l'espace salon |
| `RESEND_API_KEY`, `MAIL_FROM`, `SALON_EMAIL` | optionnel : e-mail au salon à chaque réservation / annulation |

## Développement

```sh
python3 _build/build.py   # régénère les pages depuis _build/pages (en-tête/pied communs)
```

Sans `BLOB_READ_WRITE_TOKEN`, l'API écrit dans `.data/` (pratique pour tester en local).

## À compléter avant mise en service réelle

- Téléphone (`SALON.phone` dans `api/_config.js`), SIRET et responsable dans les mentions légales.
- Vérifier l'adresse (« Imm. Le Beaugency, La Planche » provient d'un annuaire en ligne).
- Photos : actuellement recadrées depuis la fiche Google, en basse définition — à remplacer.
- Le client ne précise pas la prestation : une couleur ou des mèches réservées en ligne n'occupent
  que 35 min. Pour ces prestations longues, mieux vaut que le salon les saisisse lui-même.
