import type { Metadata } from "next";
import { CartPageContent } from "@/components/CartPageContent";

export const metadata: Metadata = {
  title: "Panier",
  robots: { index: false, follow: false },
};

export default function PanierPage() {
  return (
    <div className="shell py-16 lg:py-24">
      <p className="label mb-6 text-[color:var(--color-smoke)]">(Panier)</p>
      <h1 className="display-xl mb-14">Votre sélection</h1>

      <CartPageContent />
    </div>
  );
}
