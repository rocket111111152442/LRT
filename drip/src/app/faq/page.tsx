import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Accordion } from "@/components/Accordion";
import { RETURN_WINDOW_DAYS, SHIPPING, SHOP } from "@/lib/shop";

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description:
    "Délais de fabrication, livraison, tailles, retours, paiement : toutes les réponses sur les commandes NATURAL BRUTAL.",
};

const SECTIONS = [
  {
    heading: "Commande & fabrication",
    items: [
      {
        title: "Pourquoi un délai avant l'expédition ?",
        content:
          "Chaque pièce est confectionnée après votre commande, pas prélevée sur un stock. Comptez 2 à 5 jours ouvrés de confection, puis le délai de livraison du transporteur. C'est ce fonctionnement qui nous évite de produire des pièces qui finiraient invendues.",
      },
      {
        title: "Puis-je modifier ou annuler ma commande ?",
        content:
          "Tant que la fabrication n'a pas démarré, oui : écrivez-nous le plus vite possible avec votre numéro de commande. Une fois la pièce en production, l'annulation n'est plus possible, mais votre droit de rétractation s'applique à réception.",
      },
      {
        title: "Comment suivre ma commande ?",
        content:
          "Depuis votre compte, rubrique Commandes : le statut évolue du paiement à la livraison, et le lien de suivi du transporteur y apparaît dès l'expédition.",
      },
    ],
  },
  {
    heading: "Livraison",
    items: [
      {
        title: "Quels sont les délais et les frais ?",
        content: `${SHIPPING.zones
          .map((zone) => `${zone.label} : ${(zone.price / 100).toFixed(2)} € — ${zone.delay}`)
          .join(". ")}. La livraison est offerte dès ${SHIPPING.freeThreshold / 100} € d'achat. Ces délais s'ajoutent au temps de fabrication.`,
      },
      {
        title: "Livrez-vous à l'international ?",
        content:
          "Nous livrons en France, dans l'Union européenne, en Suisse et au Royaume-Uni. Pour ces deux derniers, des droits de douane peuvent s'appliquer à la réception : ils restent à la charge du destinataire.",
      },
      {
        title: "Mon colis n'est pas arrivé, que faire ?",
        content:
          "Vérifiez d'abord le suivi transporteur depuis votre compte. Si le colis est annoncé livré sans que vous l'ayez reçu, ou s'il n'a pas bougé depuis plus de 7 jours, écrivez-nous : on ouvre une enquête auprès du transporteur et on vous réexpédie si le colis est perdu.",
      },
    ],
  },
  {
    heading: "Tailles & entretien",
    items: [
      {
        title: "Quelle taille choisir ?",
        content:
          "Nos hauts et bas d'entraînement taillent près du corps, sans comprimer : si vous hésitez entre deux tailles et que vous cherchez de l'aisance, prenez au-dessus. Le tableau des mesures figure sur chaque fiche produit, et les casquettes sont en taille unique ajustable.",
      },
      {
        title: "Comment entretenir mes pièces ?",
        content:
          "Lavage à 30 °C sur l'envers, sans adoucissant : l'adoucissant bouche les fibres techniques et tue la respirabilité. Jamais de sèche-linge ni de repassage sur les impressions. Séchage à l'air libre. Les casquettes se lavent à la main, à l'eau froide.",
      },
    ],
  },
  {
    heading: "Retours & remboursements",
    items: [
      {
        title: "Puis-je retourner ma commande ?",
        content: `Vous disposez de ${RETURN_WINDOW_DAYS} jours après réception pour exercer votre droit de rétractation, sans avoir à vous justifier. La pièce doit être non portée, non lavée, dans son état d'origine. Les frais de retour sont à votre charge.`,
      },
      {
        title: "Quand suis-je remboursé ?",
        content:
          "Le remboursement intervient sous 14 jours après réception du retour, sur le moyen de paiement utilisé lors de l'achat. Vous recevez une confirmation par e-mail dès qu'il est émis.",
      },
      {
        title: "J'ai reçu une pièce défectueuse.",
        content:
          "Envoyez-nous une photo du défaut avec votre numéro de commande. Si le défaut est avéré, nous prenons en charge le retour et vous réexpédions une pièce neuve, ou vous remboursons intégralement. Les garanties légales de conformité et des vices cachés s'appliquent en plus de notre politique commerciale.",
      },
    ],
  },
  {
    heading: "Paiement & compte",
    items: [
      {
        title: "Quels moyens de paiement acceptez-vous ?",
        content:
          "Carte bancaire (Visa, Mastercard, American Express), Apple Pay et Google Pay, via Stripe. Le paiement se déroule sur une page sécurisée hébergée par Stripe : vos coordonnées bancaires ne transitent jamais par nos serveurs et ne sont jamais stockées par NATURAL BRUTAL.",
      },
      {
        title: "Dois-je créer un compte pour commander ?",
        content:
          "Non, la commande est possible sans compte. Créer un compte vous permet toutefois de conserver votre panier d'un appareil à l'autre, de suivre vos commandes et de laisser un avis sur les pièces reçues.",
      },
      {
        title: "Comment supprimer mon compte ?",
        content:
          `Écrivez-nous à ${SHOP.email} depuis l'adresse du compte concerné. La suppression est effective sous 30 jours ; les données de facturation sont conservées le temps imposé par la loi comptable.`,
      },
    ],
  },
];

export default function FaqPage() {
  // Données structurées FAQ : elles permettent l'affichage des questions
  // directement dans les résultats de recherche.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SECTIONS.flatMap((section) =>
      section.items.map((item) => ({
        "@type": "Question",
        name: item.title,
        acceptedAnswer: { "@type": "Answer", text: item.content },
      })),
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        eyebrow="Aide"
        title="Questions fréquentes"
        intro="Délais, tailles, retours, paiement. Si votre question n'est pas là, écrivez-nous : on répond vite."
      />

      <section className="shell pb-24">
        <div className="grid gap-14 lg:grid-cols-[240px_1fr] lg:gap-24">
          <nav className="lg:sticky lg:top-[100px] lg:self-start" aria-label="Sommaire">
            <ul className="flex flex-wrap gap-4 lg:flex-col lg:gap-3">
              {SECTIONS.map((section) => (
                <li key={section.heading}>
                  <a
                    href={`#${slug(section.heading)}`}
                    className="label link-sweep text-[color:var(--color-smoke)]"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-16">
            {SECTIONS.map((section) => (
              <section key={section.heading} id={slug(section.heading)} className="scroll-mt-28">
                <h2 className="display-lg mb-7">{section.heading}</h2>
                <Accordion items={section.items} defaultOpen={null} />
              </section>
            ))}

            <div className="hairline pt-10">
              <p className="mb-5 max-w-[48ch] text-sm text-[color:var(--color-smoke)]">
                Vous n&apos;avez pas trouvé votre réponse ?
              </p>
              <Link href="/contact" className="btn">
                Nous écrire
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
