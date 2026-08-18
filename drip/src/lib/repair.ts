import { prisma, safeQuery } from "@/lib/prisma";
import { repairFields } from "@/lib/html";

/**
 * Réparation des textes importés avant que le décodage HTML soit correct.
 *
 * Le texte abîmé est déjà en base et se suffit à lui-même : « &rsquo; » se
 * décode sans rien redemander à Printify. La réparation ne dépend donc ni de la
 * boutique sélectionnée, ni d'une synchronisation.
 *
 * Aucun texte rédigé à la main n'est concerné : personne ne tape « &eacute; ».
 */

const CHAMPS = ["name", "subtitle", "description", "composition"] as const;

/** Combien de produits portent encore un texte encodé. */
export async function countEncodedProducts() {
  return safeQuery(
    async () => {
      const produits = await prisma.product.findMany({
        where: { OR: CHAMPS.map((champ) => ({ [champ]: { contains: "&" } })) },
        select: { id: true, name: true, subtitle: true, description: true, composition: true },
      });

      return produits.filter((produit) => repairFields(produit) !== null).length;
    },
    0,
    "recherche des textes à réparer",
  );
}

export async function repairEncodedProducts() {
  const produits = await prisma.product.findMany({
    // Une entité commence toujours par « & » : ce filtre évite de relire tout
    // le catalogue pour rien.
    where: { OR: CHAMPS.map((champ) => ({ [champ]: { contains: "&" } })) },
    select: { id: true, name: true, subtitle: true, description: true, composition: true },
  });

  let repares = 0;

  for (const produit of produits) {
    const corrections = repairFields(produit);
    if (!corrections) continue;

    await prisma.product.update({ where: { id: produit.id }, data: corrections });
    repares += 1;
  }

  return repares;
}
