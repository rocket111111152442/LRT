import { prisma, safeQuery } from "@/lib/prisma";
import { repairFields } from "@/lib/html";
import {
  traduireCouleur,
  traduireNomProduit,
  traduireTaille,
} from "@/lib/traduction";

/**
 * Remise d'aplomb des textes déjà importés.
 *
 * Deux défauts se corrigent sans rien redemander à Printify, parce que la
 * matière est déjà en base :
 *
 *  1. les entités HTML restées telles quelles (« L&rsquo;instinct ») ;
 *  2. les libellés anglais des variantes et des titres, importés avant que la
 *     traduction existe (« Black / One size »).
 *
 * Aucun texte rédigé à la main n'est concerné : personne ne tape « &eacute; »,
 * et un titre déjà français ne correspond à aucun terme anglais.
 */

type ProduitTexte = {
  id: string;
  name: string;
  subtitle: string | null;
  description: string;
  composition: string | null;
  podDescription: string | null;
};

/**
 * Retours chariot d'un éditeur Windows : invisibles, mais ils font autant de
 * paragraphes vides sur la fiche. La même transformation est appliquée au
 * témoin Printify, pour que deux textes identiques le restent — sinon la fiche
 * passerait à tort pour « réécrite ici » et la synchronisation cesserait de la
 * suivre.
 */
function sansRetourChariot(texte: string) {
  return texte.replace(/\r\n?/g, "\n");
}

/** Ce que ce produit doit devenir, ou `null` s'il est déjà correct. */
function correctionsProduit(produit: ProduitTexte) {
  const decode = repairFields(produit) ?? {};

  const nomActuel = decode.name ?? produit.name;
  const nomTraduit = traduireNomProduit(nomActuel);

  const description = sansRetourChariot(decode.description ?? produit.description);
  const podDescription =
    produit.podDescription === null ? null : sansRetourChariot(produit.podDescription);

  const corrections = {
    ...decode,
    ...(nomTraduit !== produit.name ? { name: nomTraduit } : {}),
    ...(description !== produit.description ? { description } : {}),
    ...(podDescription !== produit.podDescription ? { podDescription } : {}),
  };

  return Object.keys(corrections).length > 0 ? corrections : null;
}

type VarianteTexte = {
  id: string;
  name: string;
  color: string | null;
  size: string | null;
};

function correctionsVariante(variante: VarianteTexte) {
  const color = traduireCouleur(variante.color);
  const size = traduireTaille(variante.size);

  // Le libellé affiché est reconstruit à partir des deux axes traduits, dans
  // l'ordre utilisé à l'import. Une variante sans couleur ni taille garde son
  // libellé : rien ne permettrait de le reconstruire.
  const label = [color, size].filter(Boolean).join(" / ");
  const name = label || variante.name;

  if (color === variante.color && size === variante.size && name === variante.name) {
    return null;
  }

  return { color, size, name };
}

/** Combien de fiches et de variantes attendent une correction. */
export async function countEncodedProducts() {
  return safeQuery(
    async () => {
      const [produits, variantes] = await Promise.all([
        prisma.product.findMany({
          select: {
            id: true,
            name: true,
            subtitle: true,
            description: true,
            composition: true,
            podDescription: true,
          },
        }),
        prisma.variant.findMany({
          select: { id: true, name: true, color: true, size: true },
        }),
      ]);

      return (
        produits.filter((produit) => correctionsProduit(produit) !== null).length +
        variantes.filter((variante) => correctionsVariante(variante) !== null).length
      );
    },
    0,
    "recherche des textes à réparer",
  );
}

export async function repairEncodedProducts() {
  const produits = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      subtitle: true,
      description: true,
      composition: true,
      podDescription: true,
    },
  });

  let repares = 0;

  for (const produit of produits) {
    const corrections = correctionsProduit(produit);
    if (!corrections) continue;

    await prisma.product.update({ where: { id: produit.id }, data: corrections });
    repares += 1;
  }

  const variantes = await prisma.variant.findMany({
    select: { id: true, name: true, color: true, size: true },
  });

  for (const variante of variantes) {
    const corrections = correctionsVariante(variante);
    if (!corrections) continue;

    await prisma.variant.update({ where: { id: variante.id }, data: corrections });
    repares += 1;
  }

  return repares;
}
