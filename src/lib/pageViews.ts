import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseDb, shouldUseFirebase } from "@/lib/prisma";

// Compteur de vues de page persistant.
//
// BASE = nombre de visiteurs déjà relevé sur Vercel Analytics au moment de la
// mise en place du compteur. On compte les nouveaux visiteurs À PARTIR de
// maintenant (un par session) et on les ajoute à cette base.
const BASE = 121;

const COLLECTION = "counters";
// Nouveau document : repart de zéro (l'ancien "pageViews" comptait les vues).
const DOC = "visitors";

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
