"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Le détail technique reste côté serveur : on n'expose jamais la pile
    // d'appels au visiteur.
    console.error("[natural-brutal] erreur d'affichage :", error);
  }, [error]);

  return (
    <div className="shell flex min-h-[70vh] flex-col justify-center py-24">
      <p className="label mb-8 text-[color:var(--color-smoke)]">(Incident)</p>

      <h1 className="display-xl mb-8 max-w-[16ch]">Quelque chose a lâché.</h1>

      <p className="mb-10 max-w-[48ch] text-base leading-relaxed text-[color:var(--color-smoke)]">
        La page n&apos;a pas pu être affichée. Réessayez : si le problème
        persiste, écrivez-nous et nous regardons ça.
      </p>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn">
          Réessayer
        </button>
        <Link href="/" className="btn btn-outline">
          Retour à l&apos;accueil
        </Link>
      </div>

      {error.digest && (
        <p className="label-sm mt-10 text-[color:var(--color-smoke)]">
          Référence : {error.digest}
        </p>
      )}
    </div>
  );
}
