# Requêtes SQL prêtes à coller

Ces fichiers évitent d'avoir à installer quoi que ce soit : ils se collent
directement dans **Supabase > SQL Editor**, puis « Run ».

| Fichier | Quand |
| --- | --- |
| `01-creer-les-tables.sql` | Une seule fois, avant l'ouverture. Crée les 16 tables de la boutique. |
| `02-devenir-administrateur.sql` | Après avoir créé son compte sur le site, pour accéder à `/admin`. |

`01-creer-les-tables.sql` est généré depuis `prisma/schema.prisma`. Après toute
modification du schéma, le régénérer avec :

```bash
npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script \
  > prisma/sql/01-creer-les-tables.sql
```

En local, `npm run prisma:push` reste plus pratique : il applique le schéma
directement, sans passer par ces fichiers.
