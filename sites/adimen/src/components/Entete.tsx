'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Phone, X } from 'lucide-react';

import Logo from '@/components/Logo';
import ProgressionDefilement from '@/components/ProgressionDefilement';
import { navigation } from '@/content/navigation';
import { agence } from '@/content/site';
import { useADefile } from '@/lib/navigateur';
import { cx, lienTel } from '@/lib/utils';

export default function Entete() {
  const chemin = usePathname();
  const [menuMobile, setMenuMobile] = useState(false);
  const [ouvert, setOuvert] = useState<string | null>(null);
  const enteteRef = useRef<HTMLElement | null>(null);
  const fermetureRef = useRef<number | null>(null);
  const idMenuMobile = useId();

  /* Ombre et opacité de l'en-tête, pilotées par la position de défilement. */
  const defile = useADefile(12);

  /* --- Toute navigation referme les menus ---------------------------------
     Ajustement d'état pendant le rendu plutôt que dans un effet : React
     applique la correction avant de peindre, sans rendu supplémentaire. */
  const [cheminPrecedent, setCheminPrecedent] = useState(chemin);
  if (chemin !== cheminPrecedent) {
    setCheminPrecedent(chemin);
    setMenuMobile(false);
    setOuvert(null);
  }

  /* --- Échappement, et blocage du défilement quand le panneau est ouvert --- */
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOuvert(null);
      setMenuMobile(false);
    };
    document.addEventListener('keydown', surTouche);
    return () => document.removeEventListener('keydown', surTouche);
  }, []);

  useEffect(() => {
    if (!menuMobile) return;
    const precedent = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = precedent;
    };
  }, [menuMobile]);

  /* --- Fermeture différée du sous-menu : évite le clignotement quand le
         pointeur traverse l'espace entre le bouton et le panneau ------------ */
  const annulerFermeture = useCallback(() => {
    if (fermetureRef.current) {
      window.clearTimeout(fermetureRef.current);
      fermetureRef.current = null;
    }
  }, []);

  const programmerFermeture = useCallback(() => {
    annulerFermeture();
    fermetureRef.current = window.setTimeout(() => setOuvert(null), 160);
  }, [annulerFermeture]);

  useEffect(() => () => annulerFermeture(), [annulerFermeture]);

  /* --- Le sous-menu se referme si le focus quitte l'ensemble du bloc ------- */
  const surSortieDeFocus = useCallback((e: React.FocusEvent<HTMLLIElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOuvert(null);
  }, []);

  const estActif = (href: string) =>
    href === '/' ? chemin === '/' : chemin.startsWith(href.replace(/\/$/, ''));

  return (
    <header
      ref={enteteRef}
      className={cx(
        'sans-impression sticky top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300',
        defile
          ? 'border-b border-[var(--trait)] bg-[color-mix(in_oklab,var(--color-noir)_94%,transparent)] shadow-[var(--shadow-niveau-2)] backdrop-blur-xl'
          : 'border-b border-transparent bg-[color-mix(in_oklab,var(--color-noir)_55%,transparent)] backdrop-blur-md',
      )}
    >
      <div
        className="cadre flex items-center justify-between gap-6"
        style={{ minHeight: 'var(--entete-hauteur)' }}
      >
        <Link
          href="/"
          className="rounded-[var(--radius-net)] py-2"
          aria-label={`${agence.nom} — retour à l'accueil`}
        >
          <Logo />
        </Link>

        {/* ---------------- Navigation bureau ---------------- */}
        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navigation.map((item) => {
              const aDesEnfants = Boolean(item.enfants?.length);
              const estOuvert = ouvert === item.label;

              return (
                <li
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => {
                    if (aDesEnfants) {
                      annulerFermeture();
                      setOuvert(item.label);
                    }
                  }}
                  onMouseLeave={() => aDesEnfants && programmerFermeture()}
                  onBlur={aDesEnfants ? surSortieDeFocus : undefined}
                >
                  {aDesEnfants ? (
                    <button
                      type="button"
                      aria-expanded={estOuvert}
                      aria-haspopup="true"
                      onClick={() => setOuvert(estOuvert ? null : item.label)}
                      className={cx(
                        'flex items-center gap-1.5 rounded-[var(--radius-doux)] px-3.5 py-2.5 text-menu tracking-[0.04em] transition-colors duration-200',
                        estActif(item.href) || estOuvert
                          ? 'text-ivoire'
                          : 'text-argent hover:text-ivoire',
                      )}
                    >
                      {item.label}
                      <ChevronDown
                        aria-hidden="true"
                        className={cx(
                          'size-3.5 transition-transform duration-300',
                          estOuvert && 'rotate-180',
                        )}
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={cx(
                        'block rounded-[var(--radius-doux)] px-3.5 py-2.5 text-menu tracking-[0.04em] transition-colors duration-200',
                        estActif(item.href) ? 'text-ivoire' : 'text-argent hover:text-ivoire',
                      )}
                    >
                      {item.label}
                    </Link>
                  )}

                  {/* Soulignement animé de l'onglet actif */}
                  <span
                    aria-hidden="true"
                    className={cx(
                      'pointer-events-none absolute inset-x-3.5 bottom-1 h-px origin-left bg-champagne transition-transform duration-300 ease-[var(--ease-net)]',
                      estActif(item.href) ? 'scale-x-100' : 'scale-x-0',
                    )}
                  />

                  {aDesEnfants && (
                    <div
                      className={cx(
                        'absolute left-1/2 top-full w-[23rem] -translate-x-1/2 pt-3 transition-all duration-300 ease-[var(--ease-net)]',
                        estOuvert
                          ? 'visible translate-y-0 opacity-100'
                          : 'invisible -translate-y-2 opacity-0',
                      )}
                    >
                      <ul className="verre grain relative overflow-hidden rounded-[var(--radius-carte)] p-2 shadow-[var(--shadow-niveau-4)]">
                        {item.enfants?.map((enfant) => (
                          <li key={enfant.href}>
                            <Link
                              href={enfant.href}
                              tabIndex={estOuvert ? undefined : -1}
                              className="group relative z-2 block rounded-[var(--radius-doux)] px-4 py-3 transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--color-acier)_65%,transparent)]"
                            >
                              <span className="flex items-baseline justify-between gap-3">
                                <span className="text-[0.9375rem] text-ivoire">{enfant.label}</span>
                                <span
                                  aria-hidden="true"
                                  className="h-px w-0 self-center bg-champagne transition-[width] duration-300 ease-[var(--ease-net)] group-hover:w-5"
                                />
                              </span>
                              {enfant.resume && (
                                <span className="mt-1 block text-[0.8125rem] leading-relaxed text-brume">
                                  {enfant.resume}
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ---------------- Actions ---------------- */}
        <div className="flex items-center gap-2">
          <a
            href={lienTel(agence.telephonePrincipal)}
            className="hidden items-center gap-2 rounded-[var(--radius-doux)] px-3 py-2.5 text-menu text-argent transition-colors duration-200 hover:text-champagne xl:flex"
          >
            <Phone aria-hidden="true" className="size-3.5" />
            <span>{agence.telephonePrincipalAffiche}</span>
          </a>

          <Link href="/contact/" className="btn btn-primaire hidden text-[0.875rem] sm:inline-flex">
            Évaluer ma situation
          </Link>

          <button
            type="button"
            onClick={() => setMenuMobile(true)}
            aria-expanded={menuMobile}
            aria-controls={idMenuMobile}
            className="flex size-11 items-center justify-center rounded-[var(--radius-doux)] border border-[var(--trait)] text-ivoire transition-colors duration-200 hover:border-[var(--trait-fort)] lg:hidden"
          >
            <span className="sr-only">Ouvrir le menu</span>
            <span aria-hidden="true" className="flex w-5 flex-col gap-[5px]">
              <span className="h-px w-full bg-current" />
              <span className="h-px w-full bg-current" />
              <span className="h-px w-3/5 bg-current" />
            </span>
          </button>
        </div>
      </div>

      <ProgressionDefilement />

      {/* ---------------- Panneau mobile ---------------- */}
      <div
        id={idMenuMobile}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!menuMobile}
        className={cx(
          // `overflow-hidden` découpe le tiroir lorsqu'il est rangé hors écran :
          // sans cela, sa position fixe élargirait la zone de défilement de la
          // page et provoquerait un débordement horizontal.
          'fixed inset-0 z-50 overflow-hidden lg:hidden',
          menuMobile ? 'pointer-events-auto' : 'pointer-events-none',
        )}
      >
        {/* Voile */}
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => setMenuMobile(false)}
          className={cx(
            'absolute inset-0 bg-noir/80 backdrop-blur-sm transition-opacity duration-400',
            menuMobile ? 'opacity-100' : 'opacity-0',
          )}
        />

        {/* Tiroir */}
        <div
          className={cx(
            'absolute inset-y-0 right-0 flex w-full max-w-[26rem] flex-col border-l border-[var(--trait)] bg-graphite transition-transform duration-500 ease-[var(--ease-net)]',
            menuMobile ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <div className="flex items-center justify-between border-b border-[var(--trait)] px-6 py-5">
            <Logo compact />
            <button
              type="button"
              onClick={() => setMenuMobile(false)}
              className="flex size-11 items-center justify-center rounded-[var(--radius-doux)] border border-[var(--trait)] text-ivoire transition-colors duration-200 hover:border-champagne hover:text-champagne"
            >
              <span className="sr-only">Fermer le menu</span>
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          <nav
            aria-label="Navigation mobile"
            className="flex-1 overflow-y-auto overscroll-contain px-6 py-6"
          >
            <ul className="flex flex-col gap-7">
              {navigation.map((item, indexItem) => (
                <li
                  key={item.label}
                  /* Apparition échelonnée à l'ouverture du tiroir */
                  className="transition-all duration-500 ease-[var(--ease-net)] motion-reduce:transition-none"
                  style={{
                    transitionDelay: menuMobile ? `${120 + indexItem * 70}ms` : '0ms',
                    opacity: menuMobile ? 1 : 0,
                    transform: menuMobile ? 'none' : 'translateY(14px)',
                  }}
                >
                  {item.enfants?.length ? (
                    <>
                      <p className="etiquette mb-3">{item.label}</p>
                      <ul className="flex flex-col gap-0.5">
                        {item.enfants.map((enfant) => (
                          <li key={enfant.href}>
                            <Link
                              href={enfant.href}
                              className={cx(
                                'block rounded-[var(--radius-doux)] py-2.5 text-[1.0625rem] transition-colors duration-200',
                                estActif(enfant.href)
                                  ? 'text-champagne'
                                  : 'text-argent hover:text-ivoire',
                              )}
                            >
                              {enfant.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={cx(
                        'block font-display text-t4 transition-colors duration-200',
                        estActif(item.href) ? 'text-champagne' : 'text-ivoire hover:text-champagne',
                      )}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-[var(--trait)] px-6 py-6">
            <Link href="/contact/" className="btn btn-primaire w-full">
              Évaluer ma situation
            </Link>
            <a href={lienTel(agence.telephonePrincipal)} className="btn btn-secondaire mt-3 w-full">
              <Phone aria-hidden="true" className="size-4" />
              Appeler en toute confidentialité
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
