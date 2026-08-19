"use client";

import { useActionState } from "react";
import { enablePrintifyTrackingAction } from "@/app/actions/admin";
import { FormError, FormSuccess, SubmitButton } from "@/components/forms";
import type { FormState } from "@/lib/formAction";

const etatInitial: FormState = {};

/**
 * Un clic pour brancher le suivi des colis.
 *
 * Printify prévient la boutique dès qu'un colis part ; sans cet abonnement,
 * une commande expédiée resterait affichée « en fabrication » et le client
 * n'aurait aucun numéro de suivi dans son compte.
 */
export function PrintifyTrackingButton({ actif }: { actif: boolean }) {
  const [etat, action] = useActionState(
    async () => enablePrintifyTrackingAction(),
    etatInitial,
  );

  return (
    <section className="border border-[color:var(--color-hairline)] p-5">
      <p className="label mb-3">
        Suivi des colis {actif && <span className="opacity-50">— actif</span>}
      </p>

      <p className="mb-5 max-w-[62ch] text-sm leading-relaxed">
        {actif
          ? "Printify prévient la boutique à chaque expédition : la commande passe en « expédiée » toute seule et le numéro de suivi apparaît dans le compte du client. Relancez si vous changez l'adresse du site."
          : "Pour l'instant, une commande expédiée reste affichée « en fabrication » et le client n'a pas de numéro de suivi. Un clic abonne la boutique aux avis d'expédition de Printify."}
      </p>

      <form action={action} className="flex flex-col gap-4">
        <FormError message={etat.errors?.form} />
        <FormSuccess message={etat.message} />
        <SubmitButton className="btn btn-sm self-start" pendingLabel="Activation…">
          {actif ? "Réactiver le suivi" : "Activer le suivi des colis"}
        </SubmitButton>
      </form>
    </section>
  );
}
