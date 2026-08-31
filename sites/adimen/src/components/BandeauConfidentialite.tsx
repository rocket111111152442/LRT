import { ShieldCheck } from 'lucide-react';

/**
 * Rappel discret, en tête de page, sur la confidentialité des échanges.
 * Il défile avec la page : l'en-tête collant prend ensuite sa place.
 */
export default function BandeauConfidentialite() {
  return (
    <div className="sans-impression border-b border-[var(--trait)] bg-noir">
      <div className="cadre flex items-center justify-center gap-2.5 py-2.5 text-center">
        <ShieldCheck
          className="hidden size-3.5 shrink-0 text-champagne sm:block"
          aria-hidden="true"
        />
        <p className="text-[0.75rem] leading-snug tracking-[0.02em] text-brume">
          Toutes vos demandes sont traitées de manière{' '}
          <span className="text-argent">strictement confidentielle</span>, dès le premier échange.
        </p>
      </div>
    </div>
  );
}
