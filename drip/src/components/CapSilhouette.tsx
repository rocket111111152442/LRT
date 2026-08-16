/**
 * Silhouette utilisée quand un produit n'a pas encore de visuel.
 * Un dessin assumé vaut mieux qu'une image cassée : la grille garde son rythme
 * en attendant les photos définitives.
 */
export function CapSilhouette({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative grid h-full w-full place-items-center overflow-hidden bg-[color:var(--color-ash)] ${className}`}
      aria-hidden="true"
    >
      {/* Maillot vu de face : la forme la plus lisible pour un vestiaire qui
          mêle hauts, bas et accessoires. */}
      <svg viewBox="0 0 200 200" className="w-[52%] opacity-[0.22]" fill="currentColor">
        <path d="M74 26 60 32 24 50l14 30 20-9v103h84V71l20 9 14-30-36-18-14-6c-3 11-12 18-26 18s-23-7-26-18Z" />
      </svg>

      <span className="label-sm absolute bottom-4 left-4 opacity-40">Visuel à venir</span>
    </div>
  );
}
