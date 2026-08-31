import { siteConfig } from "@/config/site";
import type { TeamMember } from "./types";

/**
 * Seuls les deux fondateurs sont nommés : ce sont les deux seules personnes
 * dont l’identité a pu être sourcée (docs/courvoisier-audit.md §1). Le
 * reste de l’équipe est décrit par fonction, jamais par un nom inventé.
 */
export const founders: TeamMember[] = siteConfig.founders.map((f) => ({
  slug: f.name.toLowerCase().replace(/\s+/g, "-"),
  name: f.name,
  role: f.role,
  agency: "direction",
  bio: f.bio,
}));

export const teamDescription =
  "Autour de Dimitri et Célia Courvoisier, l’équipe réunit des profils complémentaires — courtiers, spécialistes du marché, experts en gérance et en promotion — répartis dans les trois agences de Lausanne, Rolle et Lonay.";
