import { prisma, safeQuery } from "@/lib/prisma";

/**
 * Réglages rangés en base plutôt que dans les variables de l'hébergeur.
 *
 * Certains choix ne devraient pas obliger à ouvrir le tableau de bord de
 * l'hébergeur, à coller un identifiant et à relancer le site — surtout quand
 * l'identifiant en question n'est visible nulle part. Ceux-là vivent ici, et se
 * modifient depuis l'administration.
 */

export const PRINTIFY_SHOP_KEY = "printify.shopId";

/** `null` quand la table n'existe pas encore : le schéma est alors en retard. */
export async function readSetting(key: string): Promise<string | null | undefined> {
  return safeQuery(
    async () => {
      const row = await prisma.setting.findUnique({ where: { key } });
      return row?.value ?? null;
    },
    undefined,
    `lecture du réglage ${key}`,
  );
}

export async function writeSetting(key: string, value: string) {
  await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

export async function deleteSetting(key: string) {
  await prisma.setting.deleteMany({ where: { key } });
}

/**
 * La table des réglages est-elle en place ? Sert à proposer la mise à jour du
 * schéma dans l'administration plutôt qu'à laisser une fonctionnalité muette.
 */
export async function settingsTableReady() {
  return (await readSetting("__ping")) !== undefined;
}
