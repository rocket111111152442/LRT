# 🕺 Serveur interne Body Studio

Petit serveur local (aucune dépendance, juste Node.js) qui sert le dossier
`public/` — dont **Body Studio** — sur ce PC et sur tout le réseau Wi-Fi de la
maison (téléphone, tablette…).

## Démarrer

Double-clique sur **`demarrer-serveur.bat`** (il génère le certificat HTTPS la
première fois, puis lance le serveur).

Ou en ligne de commande :

```
node serveur-interne/serveur.mjs
```

## Ouvrir le jeu

- Sur ce PC : **https://localhost:8443/**
- Sur un téléphone/tablette (même Wi-Fi) : **https://IP-DU-PC:8443/**
  (l'adresse exacte s'affiche au démarrage du serveur)

L'adresse `/` redirige automatiquement vers `/body-studio.html`.

## Bon à savoir

- ⚠️ **Avertissement de sécurité** : le certificat est auto-signé, le navigateur
  affiche donc un avertissement la première fois → « Paramètres avancés » →
  « Continuer vers le site ». C'est normal et sans danger : le HTTPS sert
  uniquement à autoriser l'accès caméra depuis les autres appareils.
- 🔥 **Pare-feu Windows** : au premier lancement, Windows peut demander une
  autorisation pour Node.js → clique « Autoriser l'accès ».
- 🔐 Les fichiers `cert.pem` / `key.pem` restent sur ce PC (ignorés par git).
- 🛑 Arrêter le serveur : `Ctrl+C` dans la fenêtre, ou ferme-la.
- 🔌 Port occupé ? Lance avec un autre port : `PORT=9443 node serveur.mjs`.
