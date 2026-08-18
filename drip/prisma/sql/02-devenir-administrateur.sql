-- Donne les droits d'administration à un compte déjà créé sur le site.
--
-- Mode d'emploi :
--   1. Créer son compte normalement sur https://…/inscription
--   2. Remplacer l'adresse ci-dessous par celle utilisée à l'inscription
--   3. Exécuter cette requête dans Supabase > SQL Editor
--
-- L'administration devient alors accessible sur https://…/admin

UPDATE "User"
SET role = 'ADMIN'
WHERE email = 'remplacez-par-votre@email.com';

-- Vérification : doit afficher votre compte avec le rôle ADMIN.
SELECT email, role FROM "User" WHERE role = 'ADMIN';
