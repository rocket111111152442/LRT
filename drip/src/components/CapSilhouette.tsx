/**
 * Silhouette de casquette utilisée quand un produit n'a pas encore de visuel.
 * Un dessin assumé vaut mieux qu'une image cassée : la grille garde son rythme
 * en attendant les photos définitives.
 */
export function CapSilhouette({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative grid h-full w-full place-items-center overflow-hidden bg-[color:var(--color-ash)] ${className}`}
      aria-hidden="true"
    >
      {/* Casquette de profil : la calotte à gauche, la visière qui file vers la
          droite. C'est l'asymétrie de la visière qui fait lire « casquette »
          plutôt que « chapeau ». */}
      <svg
        viewBox="0 0 200 120"
        className="w-[62%] opacity-[0.22]"
        fill="currentColor"
      >
        <path d="M24 78c0-30 22-52 48-52s48 22 48 52H24Z" />
        <path d="M120 78h34c17 0 30 4 30 9s-13 7-30 7H24c-6 0-10-3-10-8s5-8 11-8h95Z" />
        <circle cx="72" cy="30" r="4.5" />
      </svg>

      <span className="label-sm absolute bottom-4 left-4 opacity-40">Visuel à venir</span>
    </div>
  );
}
