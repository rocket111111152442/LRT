import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseDb, shouldUseFirebase } from "@/lib/prisma";

// Compteur de vues de page persistant.
//
// BASE = nombre de vues déjà accumulées avant la mise en place du compteur
// (relevé sur Vercel Analytics au moment du lancement). Notre compteur compte
// les vues À PARTIR de maintenant et on l'ajoute à cette base pour rester
// cohérent avec l'historique affiché.
const BASE = 616;

const COLLECTION = "counters";
const DOC = "pageViews";

// Fallback hors Firebase (dev local) : compteur en mémoire.
let memoryCount = 0;

function docRef() {
  return getFirebaseDb().collection(COLLECTION).doc(DOC);
}

export async function incrementAndGetPageViews(): Promise<number> {
  if (shouldUseFirebase()) {
    try {
      const ref = docRef();
      await ref.set({ count: FieldValue.increment(1) }, { merge: true });
      const snapshot = await ref.get();
      const count = snapshot.data()?.count;
      return BASE + (typeof count === "number" ? count : 0);
    } catch {
      return BASE + ++memoryCount;
    }
  }

  return BASE + ++memoryCount;
}

export async function getPageViews(): Promise<number> {
  if (shouldUseFirebase()) {
    try {
      const snapshot = await docRef().get();
      const count = snapshot.data()?.count;
      return BASE + (typeof count === "number" ? count : 0);
    } catch {
      return BASE + memoryCount;
    }
  }

  return BASE + memoryCount;
}
