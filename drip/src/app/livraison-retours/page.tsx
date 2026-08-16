import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, LegalBody } from "@/components/PageHeader";
import { RETURN_WINDOW_DAYS, SHIPPING, SHOP } from "@/lib/shop";

export const metadata: Metadata = {
  title: "Livraison & retours",
  description:
    "Délais de fabrication et de livraison, frais de port, procédure de retour et de remboursement chez NATURAL BRUTAL.",
};

export default function LivraisonRetoursPage() {
  return (
    <>
      <PageHeader
        eyebrow="Aide"
        title="Livraison & retours"
        intro="Tout ce qu'il faut savoir avant de commander : combien de temps, combien ça coûte, et comment renvoyer si ça ne va pas."
      />

      <LegalBody>
        <section>
          <h2>Délai de fabrication</h2>
          <p>
            Chaque pièce est confectionnée après votre commande. Comptez 2 à 5
            jours ouvrés avant l&apos;expédition, auxquels s&apos;ajoute le délai
            d&apos;acheminement du transporteur.
          </p>
        </section>

        <section>
          <h2>Frais et délais de livraison</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[color:var(--color-hairline)] text-left">
                  <th className="py-3 pr-4 font-normal"><span className="label">Destination</span></th>
                  <th className="py-3 pr-4 font-normal"><span className="label">Délai</span></th>
                  <th className="py-3 font-normal"><span className="label">Frais</span></th>
                </tr>
              </thead>
              <tbody>
                {SHIPPING.zones.map((zone) => (
                  <tr key={zone.code} className="border-b border-[color:var(--color-hairline)]">
                    <td className="py-4 pr-4">{zone.label}</td>
                    <td className="py-4 pr-4">{zone.delay}</td>
                    <td className="py-4 font-mono text-xs">{(zone.price / 100).toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="pt-4">
            Livraison offerte dès {SHIPPING.freeThreshold / 100} € d&apos;achat,
            toutes destinations confondues. Les commandes hors Union européenne
            peuvent donner lieu à des droits de douane à la charge du
            destinataire.
          </p>
        </section>

        <section>
          <h2>Suivi</h2>
          <p>
            Dès l&apos;expédition, le numéro et le lien de suivi apparaissent
            dans votre compte, rubrique{" "}
            <Link href="/compte/commandes">Commandes</Link>, et vous sont
            envoyés par e-mail.
          </p>
        </section>

        <section>
          <h2>Retour et rétractation</h2>
          <p>
            Vous disposez de {RETURN_WINDOW_DAYS} jours après réception pour
            changer d&apos;avis, sans justification. La marche à suivre :
          </p>
          <ul>
            <li>
              Écrivez à <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a> avec
              votre numéro de commande (NB-000000).
            </li>
            <li>Nous vous répondons sous 48 heures ouvrées avec l&apos;adresse de retour.</li>
            <li>
              Renvoyez la pièce non portée, non lavée, dans son état d&apos;origine.
              Les frais de retour sont à votre charge.
            </li>
            <li>
              Le remboursement est émis sous 14 jours après réception du colis,
              sur le moyen de paiement d&apos;origine.
            </li>
          </ul>
        </section>

        <section>
          <h2>Produit défectueux ou erreur de commande</h2>
          <p>
            Envoyez-nous une photo du défaut avec votre numéro de commande. Si le
            défaut est avéré ou si nous nous sommes trompés, le retour est à
            notre charge et vous êtes réexpédié ou remboursé intégralement, à
            votre choix. Les garanties légales de conformité et des vices cachés
            s&apos;appliquent en toutes circonstances.
          </p>
        </section>

        <section>
          <h2>Échanges</h2>
          <p>
            Nos pièces étant fabriquées à la commande, nous ne pratiquons pas
            l&apos;échange direct. La marche à suivre est de retourner la pièce
            pour remboursement, puis de repasser commande sur la référence
            souhaitée.
          </p>
        </section>
      </LegalBody>
    </>
  );
}
