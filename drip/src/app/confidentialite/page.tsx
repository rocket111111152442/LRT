import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, LegalBody } from "@/components/PageHeader";
import { SHOP } from "@/lib/shop";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Comment NATURAL BRUTAL collecte, utilise et protège vos données personnelles, conformément au RGPD.",
};

export default function ConfidentialitePage() {
  return (
    <>
      <PageHeader
        eyebrow="Légal"
        title="Politique de confidentialité"
        intro="Quelles données nous collectons, pourquoi, combien de temps nous les gardons, et comment exercer vos droits."
      />

      <LegalBody>
        <section>
          <h2>1. Responsable du traitement</h2>
          <p>
            {SHOP.legalName}
            {SHOP.address ? `, ${SHOP.address}` : ""} est responsable du
            traitement des données collectées sur ce site. Pour toute question
            relative à vos données :{" "}
            <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a>.
          </p>
        </section>

        <section>
          <h2>2. Données collectées et finalités</h2>

          <h3>Création de compte</h3>
          <p>
            Prénom, nom, adresse e-mail et mot de passe (stocké sous forme
            chiffrée, jamais en clair). Base légale : exécution du contrat.
          </p>

          <h3>Commande et livraison</h3>
          <p>
            Adresse postale, téléphone, contenu de la commande et montant.
            Transmises à Stripe pour le paiement et à Printful pour la
            fabrication et l&apos;expédition. Base légale : exécution du contrat
            et obligation légale de conservation comptable.
          </p>

          <h3>Avis clients</h3>
          <p>
            Prénom, initiale du nom, note et texte de l&apos;avis. Publiés
            uniquement après vérification de l&apos;achat correspondant. Base
            légale : intérêt légitime à informer les futurs acheteurs.
          </p>

          <h3>Newsletter</h3>
          <p>
            Adresse e-mail, sur la base de votre consentement, révocable à tout
            moment via le lien de désinscription.
          </p>

          <h3>Messages de contact</h3>
          <p>
            Nom, e-mail et contenu du message, aux seules fins de répondre à
            votre demande.
          </p>
        </section>

        <section>
          <h2>3. Ce que nous ne faisons pas</h2>
          <ul>
            <li>Nous ne vendons ni ne louons vos données à des tiers.</li>
            <li>
              Nous ne stockons aucune donnée bancaire : le paiement est traité
              intégralement par Stripe.
            </li>
            <li>
              Nous n&apos;utilisons aucun traceur publicitaire ni outil de
              profilage à des fins de ciblage.
            </li>
          </ul>
        </section>

        <section>
          <h2>4. Destinataires</h2>
          <p>
            Vos données sont accessibles à l&apos;équipe NATURAL BRUTAL et aux
            sous-traitants strictement nécessaires au service :
          </p>
          <ul>
            <li>
              <strong>Stripe Payments Europe Ltd</strong> (Irlande) — traitement
              des paiements.
            </li>
            <li>
              <strong>Printful Inc.</strong> — fabrication et expédition des
              commandes.
            </li>
            <li>
              <strong>Vercel Inc.</strong> — hébergement du site et de la base
              de données.
            </li>
          </ul>
          <p>
            Certains de ces prestataires peuvent traiter des données hors de
            l&apos;Union européenne. Ces transferts sont encadrés par les clauses
            contractuelles types de la Commission européenne.
          </p>
        </section>

        <section>
          <h2>5. Durées de conservation</h2>
          <ul>
            <li>Compte client : jusqu&apos;à sa suppression, puis 30 jours.</li>
            <li>
              Documents de facturation : 10 ans, conformément au code de
              commerce.
            </li>
            <li>Paniers abandonnés : 60 jours.</li>
            <li>
              Newsletter : jusqu&apos;au retrait du consentement, puis 3 ans à
              titre de preuve.
            </li>
            <li>Messages de contact : 3 ans après le dernier échange.</li>
          </ul>
        </section>

        <section>
          <h2>6. Vos droits</h2>
          <p>
            Conformément au règlement (UE) 2016/679 et à la loi Informatique et
            Libertés, vous disposez d&apos;un droit d&apos;accès, de
            rectification, d&apos;effacement, de limitation, d&apos;opposition et
            de portabilité, ainsi que du droit de définir des directives
            relatives au sort de vos données après votre décès.
          </p>
          <p>
            Pour les exercer, écrivez à{" "}
            <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a>. Nous répondons
            sous 30 jours. En cas de désaccord persistant, vous pouvez saisir la
            CNIL (
            <a href="https://www.cnil.fr" target="_blank" rel="noreferrer noopener">
              cnil.fr
            </a>
            ).
          </p>
        </section>

        <section>
          <h2>7. Sécurité</h2>
          <p>
            Les échanges sont chiffrés en HTTPS. Les mots de passe sont hachés
            avec bcrypt. Les sessions reposent sur des cookies signés,
            inaccessibles au JavaScript du navigateur, et sont invalidées à tout
            changement de mot de passe. L&apos;accès à l&apos;administration est
            restreint aux comptes disposant du rôle correspondant.
          </p>
        </section>

        <section>
          <h2>8. Cookies</h2>
          <p>
            Le détail des cookies déposés figure sur la page{" "}
            <Link href="/cookies">Cookies</Link>.
          </p>
        </section>
      </LegalBody>
    </>
  );
}
