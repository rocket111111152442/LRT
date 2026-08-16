import Link from "next/link";
import { Logo } from "@/components/Logo";

/**
 * Cadre commun aux écrans de compte : un panneau noir éditorial à gauche, le
 * formulaire à droite. La colonne noire disparaît sur mobile pour laisser toute
 * la place au champ de saisie.
 */
export function AuthShell({
  title,
  intro,
  aside,
  children,
  footer,
}: {
  title: string;
  intro?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100vh-108px)] lg:grid-cols-2">
      <aside className="invert-block relative hidden flex-col overflow-hidden p-12 lg:flex xl:p-16">
        {/* Filigrane posé en fond plutôt que dans le flux : il ne pousse plus le
            texte et ne crée plus de bloc compact en bas de colonne. */}
        <p
          className="display pointer-events-none absolute -bottom-[0.34em] left-0 select-none text-[clamp(6rem,11vw,9.5rem)] leading-none opacity-[0.05]"
          aria-hidden="true"
        >
          BRUTAL
        </p>

        <Link href="/" aria-label="NATURAL BRUTAL — accueil" className="relative">
          <Logo size="md" />
        </Link>

        <div className="relative mt-auto max-w-[34ch] pb-4">
          {aside ?? (
            <>
              <p className="display-lg">Un compte, un panier, zéro friction.</p>
              <p className="mt-7 text-sm leading-relaxed text-[color:var(--color-ash)]">
                Retrouvez vos commandes, suivez vos colis et laissez un avis sur les
                pièces reçues.
              </p>
            </>
          )}
        </div>
      </aside>

      <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <h1 className="display-lg mb-3">{title}</h1>

          {intro && (
            <p className="mb-10 text-sm leading-relaxed text-[color:var(--color-smoke)]">
              {intro}
            </p>
          )}

          {children}

          {footer && <div className="mt-8">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
