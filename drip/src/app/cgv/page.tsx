import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, LegalBody } from "@/components/PageHeader";
import { RETURN_WINDOW_DAYS, SHIPPING, SHOP } from "@/lib/shop";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description:
    "Conditions générales de vente de la boutique NATURAL BRUTAL : commande, prix, livraison, retours, garanties légales.",
};

export default function CgvPage() {
  const updated = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <PageHeader
        eyebrow="Légal"
        title="Conditions générales de vente"
        intro={`En vigueur au ${updated}. Elles régissent toute commande passée sur ce site.`}
      />

      <LegalBody>
        <section>
          <h2>1. Objet et champ d&apos;application</h2>
          <p>
            Les présentes conditions générales de vente (les « CGV ») régissent
            les ventes de produits conclues à distance entre {SHOP.legalName}
            {SHOP.siret ? ` (SIRET ${SHOP.siret})` : ""}, ci-après « le Vendeur »,
            et toute personne physique non commerçante effectuant un achat sur ce
            site, ci-après « le Client ».
          </p>
          <p>
            Toute commande implique l&apos;acceptation sans réserve des présentes
            CGV, dans leur version en vigueur au jour de la commande. Le Client
            en conserve une copie au moment de la validation de son achat.
          </p>
        </section>

        <section>
          <h2>2. Produits</h2>
          <p>
            Les produits proposés sont ceux figurant sur le site au jour de la
            consultation, dans la limite des stocks et des capacités de
            production disponibles. Les photographies et visuels illustrant les
            produits n&apos;ont pas de valeur contractuelle : de légères
            variations de teinte ou de rendu peuvent exister d&apos;un écran à
            l&apos;autre.
          </p>
          <p>
            Les produits sont imprimés et confectionnés à l&apos;unité après la
            commande, par un prestataire partenaire, et pour le seul Client qui
            les a commandés. Aucun exemplaire n&apos;est détenu en stock. Les
            conséquences de ce mode de fabrication sur les retours sont
            détaillées à l&apos;article 8.
          </p>
        </section>

        <section>
          <h2>3. Prix</h2>
          <p>
            Les prix sont indiqués en euros, toutes taxes comprises, hors frais
            de livraison. Le Vendeur se réserve le droit de modifier ses prix à
            tout moment ; le produit est facturé sur la base du tarif en vigueur
            au moment de la validation de la commande.
          </p>
          <p>
            Les frais de livraison sont indiqués avant la validation définitive
            de la commande. La livraison est offerte à partir de{" "}
            {SHIPPING.freeThreshold / 100} € d&apos;achat.
          </p>
        </section>

        <section>
          <h2>4. Commande</h2>
          <p>
            Le Client sélectionne les produits, vérifie le détail de son panier,
            puis valide sa commande après avoir accepté les présentes CGV. La
            vente est définitivement conclue à l&apos;encaissement effectif du
            paiement.
          </p>
          <p>
            Un reçu de paiement est adressé au Client par le prestataire de
            paiement, puis un avis d&apos;expédition portant le numéro de suivi
            dès la remise du colis au transporteur. Le Vendeur se réserve le
            droit de refuser ou d&apos;annuler toute commande présentant un
            caractère anormal, notamment en cas de litige de paiement antérieur.
          </p>
        </section>

        <section>
          <h2>5. Paiement</h2>
          <p>
            Le paiement s&apos;effectue en ligne par carte bancaire, Apple Pay ou
            Google Pay, via le prestataire Stripe Payments Europe Ltd. Les
            coordonnées bancaires du Client sont transmises directement à Stripe
            sur une page sécurisée : elles ne transitent jamais par les serveurs
            du Vendeur et n&apos;y sont jamais conservées.
          </p>
          <p>
            La commande est traitée après confirmation du paiement par le
            prestataire.
          </p>
        </section>

        <section>
          <h2>6. Fabrication et livraison</h2>
          <p>
            Chaque pièce étant fabriquée après commande, un délai de confection
            de 2 à 5 jours ouvrés s&apos;ajoute au délai d&apos;acheminement.
            Les délais indicatifs par destination sont les suivants :
          </p>
          <ul>
            {SHIPPING.zones.map((zone) => (
              <li key={zone.code}>
                {zone.label} — {zone.delay} ({(zone.price / 100).toFixed(2)} €)
              </li>
            ))}
          </ul>
          <p>
            En cas de retard de livraison, le Client peut demander la résolution
            de la vente dans les conditions prévues à l&apos;article L216-6 du
            code de la consommation. Les livraisons hors Union européenne
            peuvent donner lieu à des droits de douane restant à la charge du
            destinataire.
          </p>
        </section>

        <section>
          <h2>7. Transfert de risque</h2>
          <p>
            Les risques de perte ou de détérioration sont transférés au Client au
            moment où il prend physiquement possession du produit. Toute réserve
            relative à l&apos;état du colis doit être signalée au Vendeur dans
            les meilleurs délais, photographies à l&apos;appui.
          </p>
        </section>

        <section>
          <h2>8. Retours</h2>
          <p>
            Chaque produit est imprimé et confectionné à l&apos;unité après la
            commande, sur la base du modèle, du coloris et de la taille choisis
            par le Client. Aucun exemplaire n&apos;étant fabriqué à l&apos;avance
            ni détenu en stock, un produit retourné ne peut pas être remis en
            vente. Le Vendeur ne reprend donc pas un produit conforme à la
            commande au seul motif d&apos;un changement d&apos;avis.
          </p>
          <p>
            Le Vendeur reprend en revanche intégralement, à ses frais, tout
            produit affecté d&apos;un défaut qui lui est imputable, notamment :
            impression manquée, décalée ou incomplète ; défaut de confection ;
            détérioration survenue pendant le transport ; erreur de modèle, de
            taille ou de coloris lors de la préparation.
          </p>
          <p>
            Le Client dispose de {RETURN_WINDOW_DAYS} jours à compter de la
            réception pour signaler un tel défaut à{" "}
            <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a>, en précisant le
            numéro de commande et en joignant une photographie. Le Vendeur
            procède, au choix du Client, à la refabrication et à la
            réexpédition du produit ou à son remboursement intégral, frais de
            livraison initiaux compris, au plus tard 14 jours après accord. Le
            Client n&apos;avance aucun frais de retour.
          </p>
          <p>
            Ces dispositions ne font pas obstacle aux garanties légales prévues
            à l&apos;article 9, qui demeurent applicables en toutes
            circonstances.
          </p>
        </section>

        <section>
          <h2>9. Garanties légales</h2>
          <p>
            Indépendamment de toute garantie commerciale, le Vendeur reste tenu
            de la garantie légale de conformité (articles L217-3 et suivants du
            code de la consommation) et de la garantie contre les vices cachés
            (articles 1641 et suivants du code civil).
          </p>
          <p>
            Au titre de la garantie légale de conformité, le Client dispose de
            deux ans à compter de la délivrance du bien et peut choisir entre la
            réparation et le remplacement, sous réserve des conditions de coût
            prévues par la loi. Il est dispensé de rapporter la preuve du défaut
            de conformité pendant les vingt-quatre mois suivant la délivrance.
          </p>
        </section>

        <section>
          <h2>10. Service client et réclamations</h2>
          <p>
            Toute réclamation peut être adressée à{" "}
            <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a>. Le Vendeur
            s&apos;engage à répondre sous 48 heures ouvrées.
          </p>
        </section>

        <section>
          <h2>11. Médiation de la consommation</h2>
          <p>
            Conformément à l&apos;article L612-1 du code de la consommation, le
            Client peut recourir gratuitement à un médiateur de la consommation
            en vue de la résolution amiable d&apos;un litige, après avoir tenté
            une réclamation écrite auprès du Vendeur.
          </p>
          <p>
            La plateforme européenne de règlement en ligne des litiges est
            accessible à l&apos;adresse{" "}
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noreferrer noopener"
            >
              ec.europa.eu/consumers/odr
            </a>
            .
          </p>
        </section>

        <section>
          <h2>12. Données personnelles</h2>
          <p>
            Le traitement des données personnelles est décrit dans la{" "}
            <Link href="/confidentialite">politique de confidentialité</Link>,
            qui fait partie intégrante des présentes CGV.
          </p>
        </section>

        <section>
          <h2>13. Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des éléments du site — marque, visuels, textes,
            dessins et modèles — demeure la propriété exclusive du Vendeur. Toute
            reproduction ou exploitation, totale ou partielle, sans autorisation
            écrite préalable est interdite.
          </p>
        </section>

        <section>
          <h2>14. Droit applicable</h2>
          <p>
            Les présentes CGV sont soumises au droit français. En cas de litige,
            et à défaut de résolution amiable, les tribunaux français sont
            compétents conformément aux règles de compétence applicables aux
            consommateurs.
          </p>
        </section>
      </LegalBody>
    </>
  );
}
