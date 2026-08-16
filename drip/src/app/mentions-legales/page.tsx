import type { Metadata } from "next";
import { PageHeader, LegalBody } from "@/components/PageHeader";
import { LegalNotice, missingLegalInfo } from "@/components/LegalNotice";
import { SHOP } from "@/lib/shop";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Informations légales relatives à l'éditeur et à l'hébergeur du site DRIP.",
};

export default function MentionsLegalesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Légal"
        title="Mentions légales"
        intro="Informations exigées par l'article 6 III de la loi pour la confiance dans l'économie numérique."
      />

      <LegalBody>
        <LegalNotice missing={missingLegalInfo(SHOP)} />

        <section>
          <h2>Éditeur du site</h2>
          <p>
            <strong>{SHOP.legalName}</strong>
            {SHOP.address && (
              <>
                <br />
                {SHOP.address}
              </>
            )}
            {SHOP.siret && (
              <>
                <br />
                SIRET : {SHOP.siret}
              </>
            )}
            {SHOP.vatNumber && (
              <>
                <br />
                TVA intracommunautaire : {SHOP.vatNumber}
              </>
            )}
            <br />
            Contact : <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a>
            {SHOP.phone && (
              <>
                <br />
                Téléphone : {SHOP.phone}
              </>
            )}
          </p>
        </section>

        <section>
          <h2>Directeur de la publication</h2>
          <p>Le représentant légal de {SHOP.legalName}.</p>
        </section>

        <section>
          <h2>Hébergement</h2>
          <p>
            Le site est hébergé par {SHOP.hostingProvider}. L&apos;hébergeur
            assure la mise à disposition technique du site ; il n&apos;intervient
            pas dans le contenu éditorial ni dans le traitement des commandes.
          </p>
        </section>

        <section>
          <h2>Prestataires</h2>
          <p>
            Le traitement des paiements est assuré par Stripe Payments Europe
            Ltd, 1 Grand Canal Street Lower, Dublin, Irlande. La fabrication et
            l&apos;expédition des produits sont assurées par Printful Inc. et
            ses ateliers partenaires.
          </p>
        </section>

        <section>
          <h2>Propriété intellectuelle</h2>
          <p>
            La marque DRIP, les visuels, les dessins et modèles, ainsi que
            l&apos;ensemble des contenus du site sont protégés par le droit de la
            propriété intellectuelle. Toute reproduction, représentation ou
            adaptation, totale ou partielle, sans autorisation écrite préalable
            est interdite et constitue une contrefaçon.
          </p>
        </section>

        <section>
          <h2>Responsabilité</h2>
          <p>
            L&apos;éditeur s&apos;efforce d&apos;assurer l&apos;exactitude des
            informations publiées. Il ne saurait toutefois être tenu responsable
            des omissions, inexactitudes ou carences de mise à jour, qu&apos;elles
            soient de son fait ou du fait de tiers partenaires.
          </p>
        </section>

        <section>
          <h2>Signalement de contenu</h2>
          <p>
            Tout contenu que vous jugeriez illicite peut être signalé à{" "}
            <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a>. Le signalement
            sera traité dans les meilleurs délais.
          </p>
        </section>
      </LegalBody>
    </>
  );
}
