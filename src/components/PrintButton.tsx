"use client";

import { useEffect } from "react";

export function PrintButton({
  label = "Imprimer",
  documentTitle,
}: {
  label?: string;
  documentTitle?: string;
}) {
  // Le nom du fichier PDF proposé par le navigateur reprend le titre du document.
  // On le restaure toujours après l'impression pour ne pas polluer l'onglet.
  useEffect(() => {
    if (!documentTitle) {
      return;
    }

    const original = document.title;
    const restore = () => {
      document.title = original;
    };

    window.addEventListener("afterprint", restore);
    return () => {
      window.removeEventListener("afterprint", restore);
      restore();
    };
  }, [documentTitle]);

  const handleClick = () => {
    if (documentTitle) {
      document.title = documentTitle;
    }
    window.print();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
    >
      {label}
    </button>
  );
}
