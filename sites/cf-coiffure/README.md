# CF Coiffure — site vitrine + réservation en ligne

Site du salon **CF Coiffure** (Six-Fours-les-Plages), dans l'esprit de sa déco américaine
(planches de bois, plaques d'immatriculation, rayures Martini), volontairement sobre.
HTML/CSS/JS sans framework + fonctions serverless Vercel. Seule dépendance : `@vercel/blob`.

## Pages

```
index.html              accueil (points forts, salon, aperçu des tarifs, réservation, avis, horaires, plan)
le-salon.html           présentation, galerie, prestations
tarifs.html             grille tarifaire complète + questions fréquentes
infos.html              horaires, adresse, plan, questions fréquentes
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

- **Tarifs : les prix de `PRICES` (api/_config.js) sont PROVISOIRES** — moyennes du secteur dans le
  Var, aucun tarif public du salon n'a été trouvé. À remplacer par les vrais prix avant toute diffusion.
- **Indexation bloquée** (robots.txt + en-tête `X-Robots-Tag: noindex` dans vercel.json) tant que
  tarifs et horaires ne sont pas validés. À retirer au lancement.

- Téléphone (`SALON.phone` dans `api/_config.js`), SIRET et responsable dans les mentions légales.
- Adresse : « 273 avenue Joseph Raynaud » d'après la fiche Google Maps du salon, à confirmer.
- Photos : actuellement recadrées depuis la fiche Google, en basse définition — à remplacer.
- Le client ne précise pas la prestation : une couleur ou des mèches réservées en ligne n'occupent
  que 35 min. Pour ces prestations longues, mieux vaut que le salon les saisisse lui-même.

## Animations

GSAP 3.12.5 + ScrollTrigger et Lenis 1.1.13, copiés dans `assets/vendor/` (pas de dépendance à un
CDN). Rideau Martini entre les pages, titres révélés, texte qui s'allume au défilement, galerie
horizontale épinglée (ordinateur), parallaxe, plaques qui se balancent, curseur et boutons aimantés.
Tout est coupé si le visiteur a demandé « réduire les animations », et le contenu reste visible si
les scripts ne chargent pas.

`_build/build.py` ajoute une empreinte `?v=…` aux CSS/JS : on peut les mettre en cache longtemps
sans qu'un navigateur garde une ancienne version.

## Crédits images

- Bois : textures « wood_planks » et « wood_plank_wall » de [Poly Haven](https://polyhaven.com), CC0.
- Photos d'ambiance (Wikimedia Commons) — elles ne représentent pas le salon, crédits affichés sur
  les pages et dans les mentions légales : Route 66 à Amboy (Dietmar Rabich, CC BY-SA 4.0),
  fauteuils de barbier vintage (PattayaPatrol, CC BY-SA 4.0), « Frank's by night » (Chad K,
  CC BY 2.0), panneau Route 66 Santa Monica (APK, CC BY-SA 4.0), fauteuil « Star » (Eric Polk,
  CC BY-SA 4.0).
