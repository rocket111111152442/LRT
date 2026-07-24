# Securite Qoravo

## Secrets de production

- Stocker les secrets uniquement dans les variables d'environnement Vercel.
- Utiliser des valeurs `AUTH_SECRET`, `DATA_ENCRYPTION_KEY` et
  `MODERATOR_SECRET` differentes, aleatoires, de 32 octets minimum.
- Ne jamais versionner un fichier de compte de service Firebase.
- Revoquer immediatement toute cle Stripe, SMTP ou Firebase partagee dans un
  message, une capture, un commit ou un journal public.
- Configurer `STRIPE_WEBHOOK_SECRET` et `CRON_SECRET` en production.

## Verification avant deploiement

```bash
npm audit
npm run test:security
npm run lint
npx tsc --noEmit
npm run build
```

## Signalement

Ne publiez pas une faille ni un secret dans une issue publique. Contactez
directement l'equipe Qoravo et indiquez la route concernee, l'impact observe et
les etapes minimales de reproduction, sans joindre de donnees client reelles.
