import { unstable_rethrow } from "next/navigation";
import {
  OPERATION_FAILED_MESSAGE,
  SERVICE_UNAVAILABLE_MESSAGE,
  logMissingServices,
  missingServices,
} from "@/lib/services";

/** État renvoyé par toutes les actions de formulaire, lu par `useActionState`. */
export type FormState = {
  errors?: Record<string, string>;
  message?: string;
  success?: boolean;
  /** Valeurs ressaisies, pour ne pas vider le formulaire après un échec. */
  values?: Record<string, string>;
};

/** Champs qu'on ne renvoie jamais au navigateur. */
const SENSITIVE_FIELD = /password|mot_de_passe|token|secret/i;

function submittedValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string") continue;
    if (SENSITIVE_FIELD.test(key)) continue;
    values[key] = value;
  }

  return values;
}

/**
 * Enveloppe une action de formulaire.
 *
 * Sans cela, la moindre panne — base injoignable, variable d'environnement
 * absente — remonte jusqu'à la frontière d'erreur et remplace la page entière
 * par l'écran d'incident : le formulaire rempli disparaît et la personne ne
 * sait pas ce qui s'est passé. Ici l'échec revient dans le formulaire, sous le
 * champ concerné, et la page reste en place.
 *
 * `unstable_rethrow` est indispensable : `redirect()` et `notFound()` signalent
 * leur travail en levant une erreur interne à Next.js. Elle doit repartir
 * intacte, sinon une inscription réussie serait affichée comme un échec.
 */
export async function runFormAction(
  context: string,
  formData: FormData,
  run: () => Promise<FormState>,
): Promise<FormState> {
  const gaps = missingServices();

  if (gaps.length > 0) {
    logMissingServices(context, gaps);
    return {
      errors: { form: SERVICE_UNAVAILABLE_MESSAGE },
      values: submittedValues(formData),
    };
  }

  try {
    const result = await run();

    // Tout retour en erreur repart avec la saisie : personne ne devrait avoir à
    // retaper son adresse parce qu'une case à cocher manquait.
    if (result.errors) {
      return { ...result, values: result.values ?? submittedValues(formData) };
    }

    return result;
  } catch (error) {
    unstable_rethrow(error);
    console.error(`[action] ${context} :`, error);
    return {
      errors: { form: OPERATION_FAILED_MESSAGE },
      values: submittedValues(formData),
    };
  }
}

/**
 * Même protection pour les actions qui ne rendent rien (supprimer une adresse,
 * basculer un favori). Elles n'ont pas de formulaire où afficher l'échec, mais
 * elles ne doivent pas non plus faire tomber la page : la trace part au journal
 * et l'écran reste debout.
 */
export async function runSilentAction(
  context: string,
  run: () => Promise<void>,
): Promise<void> {
  const gaps = missingServices();

  if (gaps.length > 0) {
    logMissingServices(context, gaps);
    return;
  }

  try {
    await run();
  } catch (error) {
    unstable_rethrow(error);
    console.error(`[action] ${context} :`, error);
  }
}
