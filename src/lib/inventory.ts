// Catégories d'articles du stock. Le stock n'est plus limité aux pièces de
// réparation : il peut contenir accessoires, appareils reconditionnés, outils,
// consommables, etc.
export const INVENTORY_CATEGORIES = [
  { value: "PIECE", label: "Pièce détachée" },
  { value: "ACCESSOIRE", label: "Accessoire" },
  { value: "TELEPHONE", label: "Téléphone reconditionné" },
  { value: "ORDINATEUR", label: "Ordinateur / tablette" },
  { value: "CONSOLE", label: "Console / jeux" },
  { value: "OUTIL", label: "Outil d'atelier" },
  { value: "CONSOMMABLE", label: "Consommable" },
  { value: "AUTRE", label: "Autre" },
] as const;

export type InventoryCategory = (typeof INVENTORY_CATEGORIES)[number]["value"];

const CATEGORY_VALUES = new Set<string>(
  INVENTORY_CATEGORIES.map((category) => category.value),
);

export function normalizeInventoryCategory(value: unknown): InventoryCategory {
  return typeof value === "string" && CATEGORY_VALUES.has(value)
    ? (value as InventoryCategory)
    : "PIECE";
}

export function inventoryCategoryLabel(value: string): string {
  return (
    INVENTORY_CATEGORIES.find((category) => category.value === value)?.label ??
    "Autre"
  );
}
