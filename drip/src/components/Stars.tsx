/**
 * Étoiles de notation. Le remplissage partiel est obtenu par un masque de
 * largeur : une note de 4,3 affiche bien 30 % de la cinquième étoile.
 */
export function Stars({
  rating,
  size = 12,
  className = "",
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(5, rating));

  return (
    <span
      className={`stars ${className}`}
      role="img"
      aria-label={`${clamped.toFixed(1)} sur 5`}
    >
      {[0, 1, 2, 3, 4].map((index) => {
        const fill = Math.max(0, Math.min(1, clamped - index));

        return (
          <span
            key={index}
            className="relative inline-block"
            style={{ width: size, height: size }}
            aria-hidden="true"
          >
            <StarShape size={size} className="absolute inset-0 opacity-25" filled />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <StarShape size={size} filled />
            </span>
          </span>
        );
      })}
    </span>
  );
}

function StarShape({
  size,
  filled,
  className = "",
}: {
  size: number;
  filled?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
      aria-hidden="true"
    >
      <path d="m12 2.5 2.9 6.3 6.6.8-4.9 4.6 1.3 6.8L12 17.7 6.1 21l1.3-6.8L2.5 9.6l6.6-.8L12 2.5Z" />
    </svg>
  );
}
