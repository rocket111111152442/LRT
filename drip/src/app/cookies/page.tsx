import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, LegalBody } from "@/components/PageHeader";
import { SHOP } from "@/lib/shop";

export const metadata: Metadata = {
  title: "Cookies",
  description:
    "Liste des cookies déposés par la boutique DRIP : finalité, durée de vie et caractère obligatoire.",
};

const COOKIES = [
  {
    name: "drip_session",
    purpose: "Maintient votre connexion au compte client.",
    duration: "30 jours",
    required: true,
  },
  {
    name: "drip_cart",
    purpose:
      "Rattache votre panier à votre navigateur pour le retrouver d'une visite à l'autre, même sans compte.",
    duration: "60 jours",
    required: true,
  },
  {
    name: "__stripe_mid / __stripe_sid",
    purpose:
      "Déposés par Stripe sur la page de paiement pour prévenir la fraude à la carte bancaire.",
    duration: "1 an / 30 minutes",
    required: true,
  },
];

export default function CookiesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Légal"
        title="Cookies"
        intro="Ce site n'utilise aucun cookie publicitaire ni traceur de profilage. Seuls des cookies strictement nécessaires au fonctionnement de la boutique sont déposés."
      />

      <LegalBody>
        <section>
          <h2>Pourquoi aucune bannière ?</h2>
          <p>
            Les cookies strictement nécessaires au service expressément demandé
            par l&apos;utilisateur sont dispensés de consentement préalable
            (article 82 de la loi Informatique et Libertés, recommandation CNIL
            sur les cookies). Nous n&apos;en déposons pas d&apos;autres : il n&apos;y
            a donc rien à accepter ou à refuser.
          </p>
          <p>
            Si un outil de mesure d&apos;audience ou de publicité venait à être
            ajouté, une bannière de consentement serait mise en place et cette
            page mise à jour.
          </p>
        </section>

        <section>
          <h2>Cookies déposés</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[color:var(--color-hairline)] text-left">
                  <th className="py-3 pr-4 font-normal"><span className="label">Nom</span></th>
                  <th className="py-3 pr-4 font-normal"><span className="label">Finalité</span></th>
                  <th className="py-3 pr-4 font-normal"><span className="label">Durée</span></th>
                </tr>
              </thead>
              <tbody>
                {COOKIES.map((cookie) => (
                  <tr key={cookie.name} className="border-b border-[color:var(--color-hairline)] align-top">
                    <td className="py-4 pr-4 font-mono text-xs">{cookie.name}</td>
                    <td className="py-4 pr-4 leading-relaxed">{cookie.purpose}</td>
                    <td className="py-4 pr-4 font-mono text-xs whitespace-nowrap">{cookie.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>Gérer les cookies</h2>
          <p>
            Vous pouvez supprimer ou bloquer les cookies depuis les réglages de
            votre navigateur. Attention : bloquer les cookies ci-dessus empêche
            la connexion au compte et la conservation du panier, donc le passage
            de commande.
          </p>
        </section>

        <section>
          <h2>Questions</h2>
          <p>
            Pour toute question sur ce sujet, écrivez à{" "}
            <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a>, ou consultez la{" "}
            <Link href="/confidentialite">politique de confidentialité</Link>.
          </p>
        </section>
      </LegalBody>
    </>
  );
}
