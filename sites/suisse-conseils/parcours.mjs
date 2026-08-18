/* Parcours de demande de devis.
   ------------------------------------------------------------------------
   Toutes les questions sont décrites ici, branche par branche. Pour coller au
   formulaire existant du cabinet, il suffit de modifier les libellés et les
   options ci-dessous : le rendu et la logique s'adaptent automatiquement.

   Types de question :
     choix   → boutons ; le clic enregistre la réponse et passe à la suite
     champs  → champs à remplir, puis bouton « Continuer »
*/

export const PARCOURS = [
  {
    cle: "maladie",
    nom: "Assurance maladie",
    resume: "LAMal, complémentaires, hospitalisation",
    etapes: [
      {
        type: "choix",
        titre: "Pour qui cherchez-vous une couverture ?",
        texte: "Le calcul diffère selon le nombre de personnes à assurer.",
        champ: "pour_qui",
        options: ["Pour moi", "Pour mon couple", "Pour ma famille", "Pour mon enfant"],
      },
      {
        type: "choix",
        titre: "Quelle est votre situation ?",
        texte: "Résident et frontalier ne relèvent pas du même régime.",
        champ: "situation",
        options: ["Résident en Suisse", "Frontalier", "Nouvel arrivant en Suisse"],
      },
      {
        type: "champs",
        titre: "Quelques informations sur vous",
        texte: "La prime dépend de l’âge et du lieu de domicile.",
        champs: [
          { label: "Date de naissance", nom: "naissance", type: "date" },
          { label: "Code postal (NPA)", nom: "npa", type: "text", placeholder: "1208" },
          { label: "Nombre de personnes à assurer", nom: "personnes", type: "number", placeholder: "1" },
        ],
      },
      {
        type: "champs",
        titre: "Votre couverture actuelle",
        texte: "Laissez vide si vous n’êtes pas encore assuré en Suisse.",
        champs: [
          { label: "Caisse maladie actuelle", nom: "caisse", type: "text", placeholder: "Assura, CSS, Groupe Mutuel…" },
          {
            label: "Franchise annuelle",
            nom: "franchise",
            type: "select",
            options: ["300 CHF", "500 CHF", "1 000 CHF", "1 500 CHF", "2 000 CHF", "2 500 CHF", "Je ne sais pas"],
          },
          {
            label: "Modèle d’assurance",
            nom: "modele",
            type: "select",
            options: ["Standard (libre choix du médecin)", "Médecin de famille", "HMO", "Télémédecine", "Je ne sais pas"],
          },
        ],
      },
      {
        type: "choix",
        titre: "Que souhaitez-vous comparer ?",
        texte: "On peut ne toucher qu’à une partie de votre couverture.",
        champ: "objet",
        options: [
          "L’assurance de base uniquement",
          "Les complémentaires uniquement",
          "La base et les complémentaires",
          "Une couverture hospitalisation",
        ],
      },
    ],
  },

  {
    cle: "vehicule",
    nom: "Véhicule",
    resume: "RC, casco partielle ou complète",
    etapes: [
      {
        type: "choix",
        titre: "Quel type de véhicule ?",
        texte: "",
        champ: "vehicule_type",
        options: ["Voiture", "Moto", "Scooter", "Véhicule utilitaire"],
      },
      {
        type: "champs",
        titre: "Le véhicule",
        texte: "Ces éléments suffisent pour obtenir une première offre.",
        champs: [
          { label: "Marque et modèle", nom: "vehicule_modele", type: "text", placeholder: "Skoda Octavia" },
          { label: "Année de mise en circulation", nom: "vehicule_annee", type: "number", placeholder: "2020" },
          { label: "Kilomètres par an (estimation)", nom: "vehicule_km", type: "text", placeholder: "12 000" },
        ],
      },
      {
        type: "choix",
        titre: "Quelle couverture souhaitez-vous ?",
        texte: "",
        champ: "vehicule_couverture",
        options: [
          "Responsabilité civile seule",
          "RC + casco partielle",
          "RC + casco complète",
          "À déterminer avec le conseiller",
        ],
      },
      {
        type: "choix",
        titre: "Un sinistre au cours des cinq dernières années ?",
        texte: "Cela influence directement la prime proposée.",
        champ: "vehicule_sinistres",
        options: ["Aucun", "Un sinistre", "Plusieurs sinistres"],
      },
    ],
  },

  {
    cle: "menage",
    nom: "Ménage et RC",
    resume: "Mobilier, responsabilité civile, protection juridique",
    etapes: [
      {
        type: "choix",
        titre: "Vous êtes…",
        texte: "",
        champ: "menage_statut",
        options: ["Locataire", "Propriétaire", "En colocation"],
      },
      {
        type: "champs",
        titre: "Votre logement",
        texte: "La somme d’assurance se calcule sur le volume du mobilier.",
        champs: [
          { label: "Nombre de pièces", nom: "menage_pieces", type: "text", placeholder: "3,5" },
          { label: "Code postal (NPA)", nom: "menage_npa", type: "text", placeholder: "1208" },
          { label: "Valeur estimée du mobilier", nom: "menage_valeur", type: "text", placeholder: "80 000 CHF" },
        ],
      },
      {
        type: "choix",
        titre: "Souhaitez-vous y ajouter la protection juridique ?",
        texte: "Litiges de bail, de travail, de circulation ou de consommation.",
        champ: "menage_juridique",
        options: ["Oui", "Non", "À voir avec le conseiller"],
      },
    ],
  },

  {
    cle: "prevoyance",
    nom: "3ᵉ pilier",
    resume: "Épargne retraite, fiscalité, projet immobilier",
    etapes: [
      {
        type: "choix",
        titre: "Quel est votre objectif principal ?",
        texte: "",
        champ: "prevoyance_objectif",
        options: [
          "Réduire mes impôts",
          "Préparer ma retraite",
          "Financer un bien immobilier",
          "Me couvrir en cas de coup dur",
        ],
      },
      {
        type: "choix",
        titre: "Quelle solution vous intéresse ?",
        texte: "La solution bancaire est souple, celle d’assurance couvre les risques.",
        champ: "prevoyance_solution",
        options: ["Solution bancaire", "Solution d’assurance", "Je souhaite comparer les deux"],
      },
      {
        type: "champs",
        titre: "Votre capacité d’épargne",
        texte: "Une estimation suffit, rien n’est figé.",
        champs: [
          { label: "Date de naissance", nom: "prevoyance_naissance", type: "date" },
          { label: "Montant que vous pouvez épargner par mois", nom: "prevoyance_montant", type: "text", placeholder: "300 CHF" },
          {
            label: "Votre statut fiscal",
            nom: "prevoyance_statut",
            type: "select",
            options: ["Résident imposé en Suisse", "Frontalier quasi-résident", "Frontalier non quasi-résident", "Je ne sais pas"],
          },
        ],
      },
    ],
  },

  {
    cle: "personnes",
    nom: "Revenus et famille",
    resume: "Perte de gain, invalidité, décès",
    etapes: [
      {
        type: "choix",
        titre: "Que souhaitez-vous protéger en priorité ?",
        texte: "",
        champ: "personnes_objet",
        options: [
          "Mon revenu en cas de maladie",
          "Mon revenu en cas d’accident",
          "Mes proches en cas de décès",
          "Une rente en cas d’invalidité",
        ],
      },
      {
        type: "choix",
        titre: "Quelle est votre situation professionnelle ?",
        texte: "",
        champ: "personnes_statut",
        options: ["Salarié", "Indépendant", "Sans activité lucrative", "Étudiant"],
      },
      {
        type: "champs",
        titre: "Pour calibrer la couverture",
        texte: "Ces montants restent indicatifs.",
        champs: [
          { label: "Date de naissance", nom: "personnes_naissance", type: "date" },
          { label: "Revenu annuel brut", nom: "personnes_revenu", type: "text", placeholder: "85 000 CHF" },
          { label: "Personnes à charge", nom: "personnes_charge", type: "text", placeholder: "2 enfants" },
        ],
      },
    ],
  },

  {
    cle: "entreprise",
    nom: "Entreprise",
    resume: "LAA, perte de gain, LPP, RC professionnelle",
    etapes: [
      {
        type: "choix",
        titre: "Que souhaitez-vous mettre en place ou revoir ?",
        texte: "",
        champ: "entreprise_objet",
        options: [
          "Assurance accidents (LAA)",
          "Perte de gain maladie collective",
          "Plan de prévoyance LPP",
          "RC professionnelle et locaux",
        ],
      },
      {
        type: "champs",
        titre: "Votre entreprise",
        texte: "",
        champs: [
          { label: "Raison sociale", nom: "entreprise_nom", type: "text", placeholder: "Mon entreprise Sàrl" },
          { label: "Secteur d’activité", nom: "entreprise_secteur", type: "text", placeholder: "Construction, services, commerce…" },
          { label: "Nombre de collaborateurs", nom: "entreprise_effectif", type: "number", placeholder: "5" },
        ],
      },
      {
        type: "choix",
        titre: "Avez-vous déjà des contrats en place ?",
        texte: "Nous partons toujours de l’existant avant de proposer autre chose.",
        champ: "entreprise_existant",
        options: ["Oui, à revoir", "Oui, mais je veux comparer", "Non, je démarre"],
      },
    ],
  },
];
