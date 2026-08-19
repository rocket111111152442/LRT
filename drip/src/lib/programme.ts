import { readSetting, writeSetting } from "@/lib/settings";
import { SHOP } from "@/lib/shop";

/**
 * Programme « portez-le, publiez-le ».
 *
 * Le client achète, s'habille, publie une photo en mentionnant la boutique, et
 * reçoit un code de réduction. La boutique gagne des images qu'elle n'a pas
 * payées, le client gagne une remise.
 *
 * La récompense se règle depuis l'administration : c'est un choix commercial,
 * il n'a rien à faire dans le code.
 */

export const PROGRAMME_ACTIF = "programme.actif";
export const PROGRAMME_RECOMPENSE = "programme.recompense";
export const PROGRAMME_DELAI = "programme.delai";

export type Programme = {
  actif: boolean;
  recompense: string;
  delai: string;
  instagram: string;
  tiktok: string;
  email: string;
};

const RECOMPENSE_PAR_DEFAUT = "−15 % sur votre prochaine commande";
const DELAI_PAR_DEFAUT = "48 heures ouvrées";

export async function lireProgramme(): Promise<Programme> {
  const [actif, recompense, delai] = await Promise.all([
    readSetting(PROGRAMME_ACTIF),
    readSetting(PROGRAMME_RECOMPENSE),
    readSetting(PROGRAMME_DELAI),
  ]);

  return {
    // Absent en base — table jeune ou réglage jamais touché : le programme est
    // annoncé par défaut, c'est la raison d'être de la page.
    actif: actif !== "non",
    recompense: recompense || RECOMPENSE_PAR_DEFAUT,
    delai: delai || DELAI_PAR_DEFAUT,
    instagram: SHOP.social.instagram,
    tiktok: SHOP.social.tiktok,
    email: SHOP.email,
  };
}

export async function enregistrerProgramme(valeurs: {
  actif: boolean;
  recompense: string;
  delai: string;
}) {
  await Promise.all([
    writeSetting(PROGRAMME_ACTIF, valeurs.actif ? "oui" : "non"),
    writeSetting(PROGRAMME_RECOMPENSE, valeurs.recompense.trim() || RECOMPENSE_PAR_DEFAUT),
    writeSetting(PROGRAMME_DELAI, valeurs.delai.trim() || DELAI_PAR_DEFAUT),
  ]);
}
