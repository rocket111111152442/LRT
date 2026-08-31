import type { Canton, LocalFaqItem } from "./types";
import { formatNumber } from "@/lib/utils/format";

export const siteFaq: LocalFaqItem[] = [
  {
    question: "Le forfait est-il vraiment fixe, quel que soit le prix de vente ?",
    answer:
      "Oui : le montant est déterminé avant la mise en vente, en fonction du bien et de la formule choisie, et ne varie pas avec le prix final obtenu. Voir la page Offres pour le détail des formules.",
  },
  {
    question: "Comment se déroule l'estimation en ligne ?",
    answer:
      "Le parcours en neuf étapes prend environ quatre minutes. Il se termine par une confirmation de demande : un courtier local vous recontacte ensuite pour affiner l'évaluation lors d'une visite.",
  },
  {
    question: "Puis-je changer de formule en cours de mandat ?",
    answer:
      "Les conditions de changement de formule dépendent du contrat signé avec votre courtier ; ce point doit être clarifié avant signature avec un conseiller réel.",
  },
  {
    question: "Les données de mon estimation sont-elles conservées ?",
    answer:
      "Seules les informations nécessaires au traitement de votre demande sont conservées, conformément à notre politique de confidentialité (nLPD suisse et RGPD lorsqu'applicable).",
  },
  {
    question: "Proposez-vous un accompagnement pour l'achat ?",
    answer:
      "Oui, via la recherche de biens, le calculateur de capacité d'achat et la mise en relation avec l'agent responsable de chaque bien.",
  },
  {
    question: "Que couvre le calculateur de capacité d'achat ?",
    answer:
      "Il donne un ordre de grandeur indicatif basé sur vos revenus et vos fonds propres, selon des règles usuelles simplifiées. Il ne remplace pas l'analyse d'un conseiller en financement.",
  },
];

/**
 * Génère une FAQ locale à partir des données structurées du canton, pour
 * éviter le contenu dupliqué entre pages locales (voir docs/neho-audit.md §8).
 */
export function generateCantonFaq(canton: Canton): LocalFaqItem[] {
  return [
    {
      question: `Quel est le prix moyen au m² dans le canton de ${canton.name} ?`,
      answer: `À titre indicatif (démonstration), le prix moyen constaté est d'environ CHF ${formatNumber(canton.stats.averagePricePerSqm)} par m². Il varie fortement selon la commune — voir le détail par commune sur cette page.`,
    },
    {
      question: `Combien de temps prend une vente dans le canton de ${canton.name} ?`,
      answer: `Le délai médian observé dans notre jeu de démonstration est d'environ ${canton.stats.medianSaleDays} jours entre la mise en vente et la signature. Ce chiffre dépend fortement du type de bien et de son emplacement.`,
    },
    {
      question: `Ného Concept couvre-t-il toutes les communes du canton de ${canton.name} ?`,
      answer: `Ce concept illustre la couverture avec un échantillon de communes. Dans une version connectée à une vraie source de données, la couverture réelle du canton de ${canton.name} serait présentée ici.`,
    },
  ];
}
