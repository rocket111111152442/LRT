import { missingServices } from "@/lib/services";

/**
 * Bandeau affiché au-dessus des formulaires de compte tant que la boutique
 * n'est pas reliée à sa base.
 *
 * Le formulaire reste visible et complet : dès que les variables sont
 * renseignées sur l'hébergeur, ce bandeau disparaît de lui-même et rien
 * d'autre ne change. Mieux vaut le dire que laisser quelqu'un remplir un
 * formulaire qui ne peut pas aboutir.
 */
export function ServiceNotice() {
  const gaps = missingServices();

  if (gaps.length === 0) return null;

  return (
    <div className="mb-8 border border-[color:var(--color-ink)] p-5">
      <p className="label mb-3">Comptes en cours d&apos;ouverture</p>
      <p className="text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
        La boutique finit son installation : les comptes clients ouvriront en
        même temps que les ventes. Le reste du site se visite normalement.
      </p>
    </div>
  );
}
