import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import type { MailleFil } from '@/lib/jsonld';

/**
 * Fil d'Ariane visible. Le balisage JSON-LD correspondant est posé par la page,
 * afin que le fil affiché et les données structurées ne divergent jamais.
 */
export default function FilAriane({ maillons }: { maillons: readonly MailleFil[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="sans-impression">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] text-brume">
        {maillons.map((maillon, index) => {
          const dernier = index === maillons.length - 1;
          return (
            <li key={maillon.chemin} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronRight aria-hidden="true" className="size-3 shrink-0 opacity-60" />
              )}
              {dernier ? (
                <span aria-current="page" className="text-argent">
                  {maillon.nom}
                </span>
              ) : (
                <Link
                  href={maillon.chemin}
                  className="transition-colors duration-200 hover:text-champagne"
                >
                  {maillon.nom}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
