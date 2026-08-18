"use client";

import { useActionState } from "react";
import { createAdminAction, createTablesAction } from "@/app/actions/install";
import { Field, FormError, FormSuccess, SubmitButton } from "@/components/forms";
import type { FormState } from "@/lib/formAction";
import type { InstallState } from "@/lib/install";

type Reglage = { cle: string; libelle: string; ok: boolean; detail: string };

const etatInitial: FormState = {};

export function InstallPanel({
  etat,
  reglages,
  cle,
}: {
  etat: InstallState;
  reglages: Reglage[];
  cle: string;
}) {
  const [tables, actionTables] = useActionState(
    async () => createTablesAction(cle),
    etatInitial,
  );
  const [admin, actionAdmin] = useActionState(createAdminAction, etatInitial);

  const manquantes = reglages.filter((reglage) => !reglage.ok);

  return (
    <div className="flex flex-col gap-14">
      {/* --- Ce qui est renseigné, et ce qui ne l'est pas --- */}
      <section>
        <h2 className="display-lg mb-2">1. Les clés</h2>
        <p className="mb-6 max-w-[54ch] text-sm leading-relaxed text-[color:var(--color-smoke)]">
          Elles s&apos;ajoutent sur Vercel, dans Settings → Environment
          Variables, en cochant les trois environnements. Le site doit ensuite
          être relancé (Deployments → ⋯ → Redeploy) pour les lire.
        </p>

        <ul className="flex flex-col">
          {reglages.map((reglage) => (
            <li
              key={reglage.cle}
              className="hairline-b flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4 first:border-t first:border-[color:var(--color-hairline)]"
            >
              <span className="flex items-baseline gap-3">
                <span aria-hidden="true" className="font-mono text-sm">
                  {reglage.ok ? "✓" : "→"}
                </span>
                <span>
                  <span className="block text-sm">{reglage.libelle}</span>
                  <span className="label-sm text-[color:var(--color-smoke)]">
                    {reglage.cle}
                  </span>
                </span>
              </span>
              <span className="max-w-[34ch] text-xs text-[color:var(--color-smoke)]">
                {reglage.ok ? "En place" : reglage.detail}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* --- Création des tables --- */}
      <section>
        <h2 className="display-lg mb-2">2. Les tables</h2>
        <p className="mb-6 max-w-[54ch] text-sm leading-relaxed text-[color:var(--color-smoke)]">
          Un seul clic. L&apos;opération peut être relancée sans risque : elle
          ne crée que ce qui manque et n&apos;efface jamais rien.
        </p>

        {etat.tablesCreees ? (
          <p className="border border-[color:var(--color-hairline)] px-4 py-3 text-sm">
            Les tables sont en place.
          </p>
        ) : !etat.baseConfiguree ? (
          <p className="border border-[color:var(--color-ink)] bg-[rgba(11,11,11,0.04)] px-4 py-3 text-sm">
            Reliez d&apos;abord une base de données à la boutique.
          </p>
        ) : (
          <form action={actionTables} className="flex flex-col gap-4">
            <FormError message={tables.errors?.form} />
            <FormSuccess message={tables.message} />
            <SubmitButton className="btn self-start" pendingLabel="Création…">
              Créer les tables
            </SubmitButton>
          </form>
        )}
      </section>

      {/* --- Compte administrateur --- */}
      <section>
        <h2 className="display-lg mb-2">3. Votre compte</h2>
        <p className="mb-6 max-w-[54ch] text-sm leading-relaxed text-[color:var(--color-smoke)]">
          Ce premier compte est administrateur. Dès qu&apos;il existe, cette
          page se ferme définitivement.
        </p>

        <form action={actionAdmin} className="max-w-md space-y-5">
          <input type="hidden" name="cle" value={cle} />
          <FormError message={admin.errors?.form} />
          <FormSuccess message={admin.message} />

          <Field
            label="Prénom"
            name="firstName"
            required
            autoComplete="given-name"
            error={admin.errors?.firstName}
            defaultValue={admin.values?.firstName}
          />
          <Field
            label="Adresse e-mail"
            name="email"
            type="email"
            required
            autoComplete="email"
            error={admin.errors?.email}
            defaultValue={admin.values?.email}
            placeholder="vous@exemple.com"
          />
          <Field
            label="Mot de passe"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            error={admin.errors?.password}
            hint="12 caractères minimum recommandés."
          />

          <SubmitButton pendingLabel="Création…">
            Créer mon compte administrateur
          </SubmitButton>
        </form>
      </section>

      {manquantes.length > 0 && (
        <p className="hairline pt-6 text-sm text-[color:var(--color-smoke)]">
          Il reste {manquantes.length} clé{manquantes.length > 1 ? "s" : ""} à
          renseigner sur Vercel : {manquantes.map((m) => m.cle).join(", ")}.
        </p>
      )}
    </div>
  );
}
