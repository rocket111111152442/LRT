/**
 * Contenu des pages locales.
 *
 * Les secteurs cités sont des quartiers et communes réels de chaque
 * agglomération : ils servent le référencement local sans rien affirmer sur
 * l'activité de l'agence qui ne soit déjà établi.
 */

import { bureaux, type Bureau } from '@/content/site';

export type PageVille = {
  id: 'geneve' | 'lausanne';
  chemin: string;
  bureau: Bureau;
  /** Titre du hero, une entrée par ligne. */
  titre: readonly string[];
  metaTitre: string;
  metaDescription: string;
  chapeau: string;
  /** Communes et quartiers couverts depuis ce bureau. */
  secteurs: readonly string[];
  /** Particularités du terrain local, réellement observables. */
  contexte: readonly { titre: string; texte: string }[];
};

function bureauDe(id: Bureau['id']): Bureau {
  const trouve = bureaux.find((bureau) => bureau.id === id);
  if (!trouve) throw new Error(`Bureau inconnu : ${id}`);
  return trouve;
}

export const villes: readonly PageVille[] = [
  {
    id: 'geneve',
    chemin: '/detective-geneve/',
    bureau: bureauDe('geneve'),
    titre: ['Détective privé', 'à Genève'],
    metaTitre: 'Détective privé à Genève',
    metaDescription:
      "Agence de détectives privés agréée par le Conseil d'État à Genève. Filature, enquête, recherche de personne et contre-mesures. Bureau aux Acacias, analyse gratuite au 022 300 38 05.",
    chapeau:
      "Genève accueille le siège de l'agence. C'est ici que les dossiers sont ouverts, coordonnés et archivés, et c'est le canton dont nous connaissons le mieux le terrain — sa densité, ses frontières communales rapprochées et la proximité immédiate de la France voisine.",
    secteurs: [
      'Cité et Rive',
      'Eaux-Vives',
      'Plainpalais et Acacias',
      'Servette et Petit-Saconnex',
      'Champel',
      'Carouge',
      'Lancy et Onex',
      'Vernier et Meyrin',
      'Grand-Saconnex et Ferney voisine',
      'Chêne-Bougeries et Thônex',
    ],
    contexte: [
      {
        titre: 'Un canton dense, des trajets courts',
        texte:
          "L'agglomération genevoise se traverse en peu de temps, ce qui rend une filature plus exigeante : les changements de véhicule et de relais doivent être préparés, sous peine d'être repérés au deuxième passage.",
      },
      {
        titre: 'La frontière comme paramètre',
        texte:
          "Une part importante des trajets quotidiens franchit la frontière. Une observation qui s'arrêterait à la douane laisserait le dossier incomplet ; notre réseau de correspondants permet d'en assurer la continuité.",
      },
      {
        titre: 'Un tissu économique international',
        texte:
          "Sièges de groupes, organisations et cabinets d'avocats : les vérifications pré-relation d'affaires et les contrôles de réputation y sont fréquents, et souvent soumis à des délais courts.",
      },
    ],
  },
  {
    id: 'lausanne',
    chemin: '/detective-lausanne/',
    bureau: bureauDe('lausanne'),
    titre: ['Détective privé', 'à Lausanne'],
    metaTitre: 'Détective privé à Lausanne',
    metaDescription:
      "Détectives privés à Lausanne et dans le canton de Vaud : filature, enquête de moralité, dossiers d'entreprise et contre-mesures. Bureau rue du Simplon, analyse gratuite et confidentielle.",
    chapeau:
      "Notre antenne vaudoise couvre l'agglomération lausannoise et remonte jusqu'au Nord vaudois. Le relief de la ville, ses dénivelés et ses rues en boucle imposent une préparation différente de celle d'un terrain plat : une filature s'y perd vite, ou s'y fait repérer.",
    secteurs: [
      'Centre et Flon',
      'Ouchy et Sous-Gare',
      'Chailly et Mousquines',
      'Prilly et Renens',
      'Écublens et Chavannes',
      'Pully et Lutry',
      'Épalinges et Le Mont',
      'Morges et La Côte',
      'Gros-de-Vaud',
      'Yverdon et Nord vaudois',
    ],
    contexte: [
      {
        titre: 'Un relief qui change la donne',
        texte:
          "Les dénivelés lausannois limitent les axes praticables et allongent les contournements. Une équipe qui ne connaît pas ces contraintes perd sa cible au premier changement de niveau.",
      },
      {
        titre: 'Une population étudiante et mobile',
        texte:
          "La présence des hautes écoles alimente une mobilité forte en transports publics. Les dispositifs de suivi doivent en tenir compte : la voiture n'est pas toujours le bon outil.",
      },
      {
        titre: 'Des dossiers d’entreprise et d’assurance',
        texte:
          "Le bassin vaudois concentre de nombreuses PME et régies. Les vérifications de sous-location, les contrôles de solvabilité et le suivi de dossiers d'assurance y représentent une part notable de notre activité.",
      },
    ],
  },
];

export function villeParId(id: PageVille['id']): PageVille {
  const trouve = villes.find((ville) => ville.id === id);
  if (!trouve) throw new Error(`Ville inconnue : ${id}`);
  return trouve;
}
