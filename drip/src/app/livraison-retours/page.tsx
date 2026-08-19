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
          <h2>Retours</h2>
          <p>
            Chaque pièce est imprimée et confectionnée après votre commande,
            pour vous seul. Aucune n&apos;attend en stock, et une pièce renvoyée
            ne peut pas être remise en vente. Nous ne reprenons donc pas une
            commande pour un simple changement d&apos;avis.
          </p>
          <p>
            En revanche, un problème qui vient de nous est repris intégralement,
            à notre charge :
          </p>
          <ul>
            <li>impression ratée, décalée, floue ou mal centrée&nbsp;;</li>
            <li>
              défaut de fabrication : couture ouverte, trou, tache, tissu abîmé&nbsp;;
            </li>
            <li>colis endommagé pendant le transport&nbsp;;</li>
            <li>
              erreur de notre part : mauvaise taille, mauvais coloris, mauvaise
              pièce.
            </li>
          </ul>
          <p>
            Vous avez {RETURN_WINDOW_DAYS} jours après réception pour le
            signaler. Écrivez à{" "}
            <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a> avec votre numéro
            de commande (NB-000000) et une photo du problème. Nous répondons
            sous 48 heures ouvrées, puis nous refaisons la pièce ou nous vous
            remboursons intégralement, à votre choix. Vous n&apos;avancez aucun
            frais.
          </p>
          <p>
            Les garanties légales de conformité et des vices cachés
            s&apos;appliquent en toutes circonstances, sans condition de délai
            autre que celui prévu par la loi.
          </p>
        </section>

        <section>
          <h2>Choisir la bonne taille</h2>
          <p>
            Puisqu&apos;un changement d&apos;avis n&apos;ouvre pas droit au
            retour, prenez une minute avant de valider : le tableau des tailles
            figure sur chaque fiche produit, et un doute se lève en nous
            écrivant à <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a>. Nous
            répondons plus vite qu&apos;un colis ne part.
          </p>
        </section>

        <section>
          <h2>Échanges</h2>
          <p>
            Nous ne pratiquons pas l&apos;échange de confort : une pièce
            fabriquée pour vous ne peut pas repartir chez quelqu&apos;un
            d&apos;autre. Si l&apos;erreur vient de nous, en revanche, la pièce
            juste est refaite et réexpédiée sans que vous ayez à commander de
            nouveau.
          </p>
        </section>
      </LegalBody>
    </>
  );
}
