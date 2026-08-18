"use client";

import { useActionState } from "react";
import { applySchemaAction, setPrintifyShopAction } from "@/app/actions/admin";
import { FormError, FormSuccess, SubmitButton } from "@/components/forms";
import type { FormState } from "@/lib/formAction";

const etatInitial: FormState = {};

export type ShopChoice = { id: string; title: string; salesChannel: string };

/**
 * Choix de la boutique Printify, quand le compte en contient plusieurs.
 *
 * L'identifiant d'une boutique n'apparaît nulle part dans l'interface de
 * Printify : demander de le « renseigner sur l'hébergeur » revenait à demander
 * l'impossible. On liste donc les boutiques par leur nom.
 */
export function PrintifyShopPicker({
  shops,
  selectionnee,
  fixeeParEnvironnement,
  baseAJour,
}: {
  shops: ShopChoice[];
  selectionnee: string | null;
  fixeeParEnvironnement: boolean;
  baseAJour: boolean;
}) {
  const [schema, actionSchema] = useActionState(
    async () => applySchemaAction(),
    etatInitial,
  );
  const [choix, actionChoix] = useActionState(setPrintifyShopAction, etatInitial);

  if (!baseAJour) {
    return (
      <section className="border border-[color:var(--color-ink)] p-5">
        <p className="label mb-3">Base de données à mettre à jour</p>
        <p className="mb-5 max-w-[62ch] text-sm leading-relaxed">
          Le choix de la boutique Printify se range en base, et la table qui
          l&apos;accueille n&apos;existe pas encore. Un clic suffit :
          l&apos;opération n&apos;ajoute que ce qui manque et ne supprime rien.
        </p>
        <form action={actionSchema} className="flex flex-col gap-4">
          <FormError message={schema.errors?.form} />
          <FormSuccess message={schema.message} />
          <SubmitButton className="btn btn-sm self-start" pendingLabel="Mise à jour…">
            Mettre la base à jour
          </SubmitButton>
        </form>
      </section>
    );
  }

  if (shops.length <= 1) return null;

  return (
    <section className="border border-[color:var(--color-hairline)] p-5">
      <p className="label mb-3">Boutique Printify</p>
      <p className="mb-5 max-w-[62ch] text-sm leading-relaxed text-[color:var(--color-smoke)]">
        Ce compte Printify contient {shops.length} boutiques. La synchronisation
        n&apos;importe que les produits de celle qui est cochée.
      </p>

      {fixeeParEnvironnement ? (
        <p className="text-sm">
          La boutique est imposée par la variable{" "}
          <code className="font-mono text-xs">PRINTIFY_SHOP_ID</code> sur
          l&apos;hébergeur. Retirez-la pour pouvoir choisir ici.
        </p>
      ) : (
        <form action={actionChoix} className="flex flex-col gap-5">
          <FormError message={choix.errors?.form} />
          <FormSuccess message={choix.message} />

          <fieldset className="flex flex-col gap-3">
            <legend className="sr-only">Boutique à utiliser</legend>
            {shops.map((shop) => (
              <label
                key={shop.id}
                className="flex cursor-pointer items-baseline gap-3 text-sm"
              >
                <input
                  type="radio"
                  name="shopId"
                  value={shop.id}
                  defaultChecked={shop.id === selectionnee}
                  className="mt-1"
                />
                <span>
                  <span className="block">{shop.title}</span>
                  <span className="label-sm text-[color:var(--color-smoke)]">
                    {shop.salesChannel} — {shop.id}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>

          <SubmitButton className="btn btn-sm self-start" pendingLabel="Enregistrement…">
            Utiliser cette boutique
          </SubmitButton>
        </form>
      )}
    </section>
  );
}
