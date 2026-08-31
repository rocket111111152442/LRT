/**
 * Contenus éditoriaux des univers de service.
 *
 * Les prestations listées reprennent celles annoncées par l'agence (voir
 * docs/adimen-audit.md § 3). Les formulations ont été réécrites ; le périmètre
 * factuel est inchangé. Aucune prestation n'a été ajoutée.
 */

export type Prestation = {
  titre: string;
  texte: string;
  /** Ancre stable, utilisée par les redirections 301 des anciennes pages. */
  ancre?: string;
};

export type Univers = {
  id: 'particuliers' | 'entreprises' | 'parents' | 'contre-mesures';
  href: string;
  label: string;
  /** Accroche courte, page d'accueil. */
  accroche: string;
  /** Chapeau de la page dédiée. */
  chapeau: string;
  prestations: readonly Prestation[];
  /** Teinte d'accent propre à l'univers, appliquée aux dégradés et aux liserés. */
  teinte: 'champagne' | 'acier' | 'ardoise' | 'tactique';
};

export const univers: readonly Univers[] = [
  {
    id: 'particuliers',
    href: '/services/particuliers/',
    label: 'Particuliers',
    teinte: 'champagne',
    accroche:
      "Établir des faits dans une situation personnelle difficile, avec la retenue qu'elle impose.",
    chapeau:
      "Une séparation, un doute, un conflit de voisinage ou la disparition d'un proche placent chacun devant la même difficulté : distinguer ce que l'on croit de ce que l'on peut démontrer. Notre rôle est de rétablir cette distinction, discrètement, et de vous remettre des éléments matériels sur lesquels vous pourrez appuyer vos décisions.",
    prestations: [
      {
        titre: 'Suspicion d’infidélité',
        ancre: 'infidelite',
        texte:
          "Constater ou écarter une situation d'adultère par la filature et la surveillance, dans le respect strict du cadre légal suisse. Les constatations sont consignées, datées et illustrées.",
      },
      {
        titre: 'Enquête de moralité',
        texte:
          "Vérifier le train de vie, l'environnement et les fréquentations d'une personne avant un engagement personnel ou familial important.",
      },
      {
        titre: 'Filature et surveillance',
        texte:
          'Suivre des déplacements et documenter des habitudes de vie sur la durée nécessaire, avec une équipe dimensionnée pour rester invisible.',
      },
      {
        titre: 'Rapports conflictuels',
        texte:
          "Documenter un conflit de travail, un différend de voisinage ou une situation de garde d'enfant, lorsque les faits sont contestés par la partie adverse.",
      },
      {
        titre: 'Menaces et abus de confiance',
        texte:
          "Identifier l'origine de menaces, de harcèlement ou de manœuvres frauduleuses, et réunir de quoi les établir.",
      },
      {
        titre: 'Recherche de personne',
        texte:
          "Retrouver une personne disparue, un débiteur ou un proche perdu de vue, en Suisse comme à l'étranger grâce à notre réseau de correspondants.",
      },
    ],
  },
  {
    id: 'entreprises',
    href: '/services/entreprises/',
    label: 'Entreprises',
    teinte: 'acier',
    accroche:
      'Sécuriser une décision commerciale, un contrat ou un dossier contentieux par des faits vérifiés.',
    chapeau:
      "Cabinets d'avocats, PME romandes, groupes nationaux et internationaux, compagnies d'assurance, régies immobilières et agences publiques nous confient les vérifications qu'ils ne peuvent pas conduire eux-mêmes. Nous intervenons en amont d'un engagement, pendant un litige, ou pour objectiver une situation devenue incertaine.",
    prestations: [
      {
        titre: 'Enquête pré-relation d’affaires',
        texte:
          "Vérifier qui se trouve réellement en face de vous avant de signer : structure, dirigeants, antécédents, cohérence de l'activité déclarée.",
      },
      {
        titre: 'Contrôle de solvabilité',
        texte:
          "Apprécier la capacité financière réelle d'un partenaire, d'un locataire ou d'un débiteur avant d'engager des fonds ou une procédure.",
      },
      {
        titre: 'Vérification de réputation',
        texte:
          "Recouper l'image publique d'une personne ou d'une société avec ce que révèlent le terrain et les sources ouvertes.",
      },
      {
        titre: 'Arrêts de travail suspects',
        texte:
          'Objectiver une incapacité de travail dont la réalité est mise en doute, par des constatations menées depuis le domaine public.',
      },
      {
        titre: 'Assurance maladie et accident',
        texte:
          "Assister les compagnies d'assurance dans le suivi de dossiers sinistres et la vérification de déclarations contestées.",
      },
      {
        titre: 'Vérification de sous-location',
        texte:
          "Établir l'occupation réelle d'un logement ou d'un local commercial lorsqu'une sous-location non autorisée est suspectée.",
      },
      {
        titre: 'Investissement immobilier',
        texte:
          'Produire un rapport de situation sur un bien, son environnement et son occupation avant une acquisition.',
      },
      {
        titre: 'Concurrence et loyauté',
        texte:
          "Réunir les constatations utiles lorsqu'un ancien collaborateur ou un concurrent est soupçonné de détourner une activité.",
      },
    ],
  },
  {
    id: 'parents',
    href: '/services/parents/',
    label: 'Parents',
    teinte: 'ardoise',
    accroche:
      "Comprendre l'environnement réel d'un adolescent avant que la situation ne s'aggrave.",
    chapeau:
      "Nous intervenons auprès de familles en difficulté, à la demande de parents qui constatent un changement de comportement sans parvenir à en identifier la cause. Notre mission n'est pas de surveiller un enfant pour le surveiller : elle est de documenter un contexte, pour que vous puissiez agir en connaissance de cause — ou être rassurés.",
    prestations: [
      {
        titre: 'Contexte social et fréquentations',
        texte:
          "Identifier l'entourage réel d'un adolescent, les lieux qu'il fréquente et les personnes qui l'accompagnent.",
      },
      {
        titre: 'Consommation de stupéfiants',
        ancre: 'stupefiants',
        texte:
          "Vérifier une suspicion de consommation ou d'approvisionnement en stupéfiants, chez un adolescent comme chez un adulte.",
      },
      {
        titre: 'Consommation d’alcool',
        ancre: 'alcool',
        texte:
          "Documenter des habitudes de consommation d'alcool lorsqu'elles font peser un risque sur la scolarité, la conduite ou la sécurité.",
      },
      {
        titre: 'Environnement à risque',
        texte:
          "Repérer une exposition à un milieu dangereux, à une emprise ou à une sollicitation répétée, et en mesurer l'ampleur.",
      },
    ],
  },
  {
    id: 'contre-mesures',
    href: '/services/contre-mesures/',
    label: 'Contre-mesures',
    teinte: 'tactique',
    accroche: 'Rendre à un local, un domicile ou un véhicule la confidentialité qu’on lui suppose.',
    chapeau:
      "Les contre-mesures électroniques consistent à détecter les dispositifs de surveillance installés à votre insu : micros dissimulés, caméras espions, balises de géolocalisation posées sur un véhicule. Nos équipes spécialisées disposent d'un matériel de détection de pointe et interviennent sur les locaux professionnels, les domiciles privés et les véhicules.",
    prestations: [
      {
        titre: 'Détection de micros',
        texte:
          "Recherche de dispositifs d'écoute dissimulés dans le mobilier, les cloisons, les luminaires ou les équipements techniques d'un local.",
      },
      {
        titre: 'Détection de caméras espions',
        texte:
          "Recherche de dispositifs de captation d'image, y compris les modèles sans émission radio permanente.",
      },
      {
        titre: 'Balises de géolocalisation',
        texte:
          "Inspection d'un véhicule à la recherche de traceurs posés à l'insu du propriétaire ou de l'utilisateur.",
      },
      {
        titre: 'Contre-filature',
        texte:
          "Déterminer si une personne fait l'objet d'un suivi, identifier qui la suit et selon quel dispositif.",
      },
      {
        titre: 'Protection des échanges',
        texte:
          'Sécuriser les lieux où se tiennent des discussions sensibles, afin de garantir la confidentialité des communications.',
      },
    ],
  },
];

export function universParId(id: Univers['id']): Univers {
  const trouve = univers.find((u) => u.id === id);
  if (!trouve) throw new Error(`Univers inconnu : ${id}`);
  return trouve;
}

/** Domaines d'expertise transverses, présentés sur la page d'accueil et la page agence. */
export const expertises = [
  {
    titre: 'Filature et surveillance',
    texte:
      "Suivre des déplacements sur la durée sans jamais être remarqué : c'est le cœur du métier et ce qui distingue une équipe entraînée d'un observateur isolé.",
  },
  {
    titre: 'Enquête et recoupement',
    texte:
      "Croiser sources ouvertes, registres accessibles et constatations de terrain jusqu'à obtenir un faisceau d'éléments cohérent.",
  },
  {
    titre: 'Vidéo-surveillance',
    texte:
      'Capter une image exploitable dans des conditions difficiles — distance, faible lumière, mouvement — sans révéler le dispositif.',
  },
  {
    titre: 'Infiltration',
    texte:
      "Approcher un milieu fermé lorsque l'observation extérieure ne suffit plus, avec la préparation que cela exige.",
  },
  {
    titre: 'Contre-mesures électroniques',
    texte:
      'Détecter les micros, caméras et balises installés à votre insu, et restituer un environnement sûr.',
  },
  {
    titre: 'Recherche internationale',
    texte:
      "Prolonger une enquête au-delà de la frontière en s'appuyant sur des correspondants établis localement.",
  },
] as const;

/** Le processus en quatre étapes. */
export const processus = [
  {
    numero: '01',
    titre: 'Analyse gratuite',
    texte:
      'Nous recevons votre demande, écoutons la situation et déterminons ce qui peut être établi. Cette évaluation est gratuite et sans engagement, et comprend une étude de faisabilité et de coût.',
  },
  {
    numero: '02',
    titre: 'Devis personnalisé',
    texte:
      'Objectifs, moyens à engager, durée estimée et budget sont fixés par écrit avant toute intervention. Les honoraires dépendent de la complexité du dossier et des ressources nécessaires.',
  },
  {
    numero: '03',
    titre: 'Enquête et investigation',
    texte:
      "Nos équipes interviennent sur le terrain. Vous êtes informé en temps réel de l'avancée de l'enquête et des frais engagés : vous gardez la main et pouvez dire « stop » à tout moment.",
  },
  {
    numero: '04',
    titre: 'Rapport détaillé',
    texte:
      "À l'issue de la mission, nous vous remettons un rapport détaillé et horodaté réunissant les constatations, les photographies et les vidéos recueillies au cours de l'enquête.",
  },
] as const;

/** Les garanties de l'agence. */
export const garanties = [
  {
    titre: 'Discrétion',
    texte:
      'Toutes vos demandes sont traitées de manière strictement confidentielle, dès le premier échange. Nos interventions sont conçues pour ne laisser aucune trace visible.',
  },
  {
    titre: 'Expérience',
    texte:
      "Plus de dix ans de terrain en Suisse romande, sur des enquêtes privées comme commerciales. Nos agents disposent d'une expérience spécifique en vidéo-surveillance, en infiltration et en détection de dispositifs espions.",
  },
  {
    titre: 'Cadre légal',
    texte:
      "L'agence est agréée par le Conseil d'État à Genève et chaque agent est titulaire de l'autorisation du Département de la sécurité et de l'économie.",
  },
  {
    titre: 'Fiabilité',
    texte:
      "Un interlocuteur unique suit votre dossier du premier entretien à la remise du rapport. Vos objectifs sont définis dès la première rencontre pour orienter l'enquête dans la bonne direction.",
  },
  {
    titre: 'Rapports détaillés',
    texte:
      'Chaque mission se conclut par un rapport détaillé et horodaté, comprenant les photographies et les vidéos des éléments recueillis.',
  },
  {
    titre: 'Données protégées',
    texte:
      'Les informations recueillies et transmises sont conservées sur des serveurs sécurisés situés en Suisse, pendant toute la durée des investigations.',
  },
] as const;
