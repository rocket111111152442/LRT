import type { Metadata } from "next";
import { CartPageContent } from "@/components/CartPageContent";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Panier",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ annule?: string }>;

export default async function PanierPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Stripe renvoie ici quand le client quitte la caisse. Sans un mot, la page
  // ressemble à un échec silencieux : on arrive sur son panier sans savoir
  // pourquoi, ni si quelque chose a été débité.
  const { annule } = await searchParams;
  const user = await getCurrentUser();

  return (
    <div className="shell py-16 lg:py-24">
      <p className="label mb-6 text-[color:var(--color-smoke)]">(Panier)</p>
      <h1 className="display-xl mb-14">Votre sélection</h1>

      {annule && (
        <div
          className="mb-12 border border-[color:var(--color-ink)] p-5"
          role="status"
        >
          <p className="label mb-2">Paiement interrompu</p>
          <p className="max-w-[62ch] text-sm leading-relaxed">
            Vous avez quitté la page de paiement : rien n&apos;a été débité et
            votre sélection est intacte. Reprenez quand vous voulez, le panier
            vous attend.
          </p>
        </div>
      )}

      <CartPageContent loggedIn={Boolean(user)} />
    </div>
  );
}
