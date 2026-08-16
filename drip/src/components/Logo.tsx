/**
 * Marque typographique DRIP.
 *
 * Le mot est composé dans la fonte d'affichage et la goutte est dessinée en
 * SVG : l'ensemble hérite de `currentColor`, donc le logo fonctionne aussi bien
 * sur fond clair que sur fond noir sans double fichier.
 *
 * Pour utiliser le logo dessiné à la main : déposer le fichier dans
 * `public/logo.svg` et remplacer le contenu de ce composant par une <Image>.
 */
export function Logo({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const scale = {
    sm: "text-[1.35rem]",
    md: "text-[1.75rem]",
    lg: "text-[2.5rem]",
  }[size];

  return (
    <span
      className={`group/logo relative inline-flex items-end leading-none ${className}`}
      aria-label="DRIP"
    >
      <span className={`display ${scale} tracking-[-0.04em]`} aria-hidden="true">
        DRIP
      </span>

      {/* La goutte tombe légèrement au survol du logo. */}
      <svg
        viewBox="0 0 12 20"
        className="ml-[3px] h-[0.55em] w-auto translate-y-[0.08em] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/logo:translate-y-[0.3em]"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M6 0c0 4.2 6 7.6 6 13.1A6 6 0 0 1 0 13.1C0 7.6 6 4.2 6 0Z" />
      </svg>
    </span>
  );
}
