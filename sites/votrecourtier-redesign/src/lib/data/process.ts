export type ProcessStep = {
  index: string;
  title: string;
  description: string;
};

export const processSteps: ProcessStep[] = [
  {
    index: "01",
    title: "Estimation",
    description:
      "Visite du bien, analyse comparative du marché local et remise d'une estimation détaillée par un expert breveté, sans engagement.",
  },
  {
    index: "02",
    title: "Mandat",
    description:
      "Définition ensemble de la stratégie de vente : prix, calendrier, mandat exclusif ou ouvert selon votre situation.",
  },
  {
    index: "03",
    title: "Mise en valeur",
    description:
      "Photographies professionnelles, plans, rédaction de l'annonce et, pour les projets neufs, visuels de commercialisation.",
  },
  {
    index: "04",
    title: "Diffusion",
    description:
      "Publication sur les principaux portails suisses et présentation ciblée à notre réseau d'acquéreurs qualifiés.",
  },
  {
    index: "05",
    title: "Visites",
    description:
      "Organisation et conduite des visites, retours systématiques après chaque rendez-vous, ajustement de la stratégie si nécessaire.",
  },
  {
    index: "06",
    title: "Vente & notaire",
    description:
      "Négociation, vérification des conditions de l'offre et accompagnement jusqu'à la signature de l'acte authentique.",
  },
];
