import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";
import { AddressForm } from "@/components/AddressForm";
import { deleteAddressAction } from "@/app/actions/account";
import { AddressCard } from "@/components/AddressCard";

export const metadata: Metadata = {
  title: "Mes adresses",
  robots: { index: false, follow: false },
};

export default async function AdressesPage() {
  const user = await requireUser("/compte/adresses");

  const addresses = await safeQuery(
    () =>
      prisma.address.findMany({
        where: { userId: user.id },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      }),
    [],
    "liste des adresses",
  );

  return (
    <div className="space-y-14">
      <section>
        <h2 className="display-lg mb-3">Adresses</h2>
        <p className="mb-8 max-w-[54ch] text-sm text-[color:var(--color-smoke)]">
          Ces adresses sont enregistrées pour vous. Au moment du paiement,
          l&apos;adresse de livraison est saisie sur la page sécurisée Stripe —
          c&apos;est elle qui fait foi pour l&apos;expédition.
        </p>

        {addresses.length === 0 ? (
          <p className="text-sm text-[color:var(--color-smoke)]">
            Aucune adresse enregistrée pour le moment.
          </p>
        ) : (
          <div className="grid gap-px sm:grid-cols-2">
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={{
                  id: address.id,
                  label: address.label,
                  fullName: address.fullName,
                  line1: address.line1,
                  line2: address.line2,
                  postalCode: address.postalCode,
                  city: address.city,
                  country: address.country,
                  phone: address.phone,
                  isDefault: address.isDefault,
                }}
                deleteAction={deleteAddressAction}
              />
            ))}
          </div>
        )}
      </section>

      <section className="border border-[color:var(--color-hairline)] p-7">
        <h3 className="label mb-7">Ajouter une adresse</h3>
        <AddressForm />
      </section>
    </div>
  );
}
