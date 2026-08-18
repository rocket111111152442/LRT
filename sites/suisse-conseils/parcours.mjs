/* Parcours de demande de devis.
   ------------------------------------------------------------------------
   La branche « Assurance maladie » reprend exactement les questions, les
   options et le nom des étapes du formulaire du cabinet
   (suisse-conseilsm.ch/formulaire-assurance-maladie/).

   Structure : chaque branche a des étapes ; chaque étape porte un nom (affiché
   dans le fil de progression) et une ou plusieurs questions.

   Types de question :
     choix   → boutons, une seule réponse
     multi   → boutons, plusieurs réponses possibles
     champs  → champs à remplir

   Une étape qui ne contient qu'une question de type « choix » passe à la
   suivante dès le clic ; sinon un bouton « Continuer » apparaît.
*/

export const PARCOURS = [
  {
    cle: "maladie",
    nom: "Assurance maladie",
    resume: "LAMal, franchise, complémentaires",
    etapes: [
      {
        nom: "Canton",
        questions: [
          {
            type: "choix",
            titre: "Dans quel canton habitez-vous ?",
            champ: "canton",
            options: ["Genève", "Vaud", "Fribourg", "Neuchâtel", "Jura", "Berne"],
          },
        ],
      },
      {
        nom: "Profil",
        questions: [
          {
            type: "choix",
            titre: "Quelle est votre tranche d’âge ?",
            champ: "age",
            options: ["0–18 ans", "15–25 ans", "26 ans et plus"],
          },
          {
            type: "choix",
            titre: "Couverture accident",
            champ: "accident",
            options: ["Avec accident", "Sans accident"],
          },
        ],
      },
      {
        nom: "Franchise",
        questions: [
          {
            type: "choix",
            titre: "Quelle franchise souhaitez-vous ?",
            champ: "franchise",
            options: ["CHF 300.–", "CHF 1'000.–", "CHF 2'500.–"],
          },
        ],
      },
      {
        nom: "Couverture",
        questions: [
          {
            type: "choix",
            titre: "Type de couverture",
            champ: "couverture",
            options: ["Seul(e)", "Famille"],
          },
        ],
      },
      {
        nom: "Options",
        questions: [
          {
            type: "multi",
            titre: "Complémentaires souhaitées (facultatif)",
            champ: "complementaires",
            options: [
              "Dentaire",
              "Fitness",
              "Lunettes/lentilles",
              "Dents (orthodontie, enfants)",
              "Hospitalisation (demi-privée/privée)",
              "Voyage",
            ],
          },
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
        nom: "Véhicule",
        questions: [
          {
            type: "choix",
            titre: "Quel type de véhicule ?",
            champ: "vehicule_type",
            options: ["Voiture", "Moto", "Scooter", "Véhicule utilitaire"],
          },
        ],
      },
      {
        nom: "Détails",
        questions: [
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
        ],
      },
      {
        nom: "Couverture",
        questions: [
          {
            type: "choix",
            titre: "Quelle couverture souhaitez-vous ?",
            champ: "vehicule_couverture",
            options: [
              "Responsabilité civile seule",
              "RC + casco partielle",
              "RC + casco complète",
              "À déterminer avec le conseiller",
            ],
          },
        ],
      },
      {
        nom: "Sinistres",
        questions: [
          {
            type: "choix",
            titre: "Un sinistre au cours des cinq dernières années ?",
            champ: "vehicule_sinistres",
            options: ["Aucun", "Un sinistre", "Plusieurs sinistres"],
          },
        ],
      },
    ],
  },

  {
    cle: "menage",
    nom: "Ménage et RC",
    resume: "Mobilier, responsabilité civile, protection juridique",
    etapes: [
      {
        nom: "Logement",
        questions: [
          {
            type: "choix",
            titre: "Vous êtes…",
            champ: "menage_statut",
            options: ["Locataire", "Propriétaire", "En colocation"],
          },
        ],
      },
      {
        nom: "Détails",
        questions: [
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
        ],
      },
      {
        nom: "Options",
        questions: [
          {
            type: "multi",
            titre: "Ce que vous souhaitez couvrir (facultatif)",
            champ: "menage_options",
            options: [
              "Mobilier de ménage",
              "Responsabilité civile privée",
              "Protection juridique",
              "Vol à l’extérieur",
              "Objets de valeur",
            ],
          },
        ],
      },
    ],
  },

  {
    cle: "prevoyance",
    nom: "3ᵉ pilier",
    resume: "Épargne retraite, fiscalité, projet immobilier",
    etapes: [
      {
        nom: "Objectif",
        questions: [
          {
            type: "choix",
            titre: "Quel est votre objectif principal ?",
            champ: "prevoyance_objectif",
            options: [
              "Réduire mes impôts",
              "Préparer ma retraite",
              "Financer un bien immobilier",
              "Me couvrir en cas de coup dur",
            ],
          },
        ],
      },
      {
        nom: "Solution",
        questions: [
          {
            type: "choix",
            titre: "Quelle solution vous intéresse ?",
            texte: "La solution bancaire est souple, celle d’assurance couvre les risques.",
            champ: "prevoyance_solution",
            options: ["Solution bancaire", "Solution d’assurance", "Je souhaite comparer les deux"],
          },
        ],
      },
      {
        nom: "Profil",
        questions: [
          {
            type: "choix",
            titre: "Votre statut fiscal",
            champ: "prevoyance_statut",
            options: [
              "Résident imposé en Suisse",
              "Frontalier quasi-résident",
              "Frontalier non quasi-résident",
              "Je ne sais pas",
            ],
          },
          {
            type: "champs",
            titre: "",
            champs: [
              { label: "Date de naissance", nom: "prevoyance_naissance", type: "date" },
              { label: "Montant épargné par mois", nom: "prevoyance_montant", type: "text", placeholder: "300 CHF" },
            ],
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
        nom: "Besoin",
        questions: [
          {
            type: "choix",
            titre: "Que souhaitez-vous protéger en priorité ?",
            champ: "personnes_objet",
            options: [
              "Mon revenu en cas de maladie",
              "Mon revenu en cas d’accident",
              "Mes proches en cas de décès",
              "Une rente en cas d’invalidité",
            ],
          },
        ],
      },
      {
        nom: "Statut",
        questions: [
          {
            type: "choix",
            titre: "Quelle est votre situation professionnelle ?",
            champ: "personnes_statut",
            options: ["Salarié", "Indépendant", "Sans activité lucrative", "Étudiant"],
          },
        ],
      },
      {
        nom: "Détails",
        questions: [
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
    ],
  },

  {
    cle: "entreprise",
    nom: "Entreprise",
    resume: "LAA, perte de gain, LPP, RC professionnelle",
    etapes: [
      {
        nom: "Besoin",
        questions: [
          {
            type: "multi",
            titre: "Que souhaitez-vous mettre en place ou revoir ?",
            champ: "entreprise_objet",
            options: [
              "Assurance accidents (LAA)",
              "Perte de gain maladie collective",
              "Plan de prévoyance LPP",
              "RC professionnelle",
              "Locaux et matériel",
            ],
          },
        ],
      },
      {
        nom: "Entreprise",
        questions: [
          {
            type: "champs",
            titre: "Votre entreprise",
            champs: [
              { label: "Raison sociale", nom: "entreprise_nom", type: "text", placeholder: "Mon entreprise Sàrl" },
              { label: "Secteur d’activité", nom: "entreprise_secteur", type: "text", placeholder: "Construction, services, commerce…" },
              { label: "Nombre de collaborateurs", nom: "entreprise_effectif", type: "number", placeholder: "5" },
            ],
          },
        ],
      },
      {
        nom: "Existant",
        questions: [
          {
            type: "choix",
            titre: "Avez-vous déjà des contrats en place ?",
            texte: "Nous partons toujours de l’existant avant de proposer autre chose.",
            champ: "entreprise_existant",
            options: ["Oui, à revoir", "Oui, mais je veux comparer", "Non, je démarre"],
          },
        ],
      },
    ],
  },
];
