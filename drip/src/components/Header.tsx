"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { useCart } from "@/components/CartProvider";
import { SHOP } from "@/lib/shop";
import type { SessionUser } from "@/lib/auth";

const NAV = [
  { href: "/boutique", label: "Boutique" },
  { href: "/boutique?tri=nouveautes", label: "Nouveautés" },
  { href: "/histoire", label: "L'atelier" },
  { href: "/avis", label: "Avis" },
  { href: "/contact", label: "Contact" },
];

const TICKER = [
  "Livraison offerte dès 80 €",
  "Fabriqué à la commande",
  "Fait pour l'entraînement",
  "Défaut repris sous 14 jours",
  "Paiement sécurisé",
];

export function Header({ user }: { user: SessionUser | null }) {
  const { cart, open } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchField = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let lastY = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      // L'en-tête s'efface quand on descend et revient dès qu'on remonte :
      // on rend l'écran au contenu sans perdre l'accès au panier.
      setHidden(y > 220 && y > lastY);
      lastY = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Changer de page referme ce qui était ouvert : sans cela le menu mobile
  // resterait par-dessus la page d'arrivée. L'ajustement se fait pendant le
  // rendu — c'est la forme recommandée pour un état dérivé d'une prop, et
  // elle évite le rendu intermédiaire qu'un effet provoquerait.
  const [pathVu, setPathVu] = useState(pathname);

  if (pathVu !== pathname) {
    setPathVu(pathname);
    setMenuOpen(false);
    setSearchOpen(false);
  }

  useEffect(() => {
    if (!searchOpen) return;

    searchField.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSearchOpen(false);
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = new FormData(event.currentTarget).get("q");
    const terme = typeof query === "string" ? query.trim() : "";

    setSearchOpen(false);
    router.push(terme ? `/boutique?q=${encodeURIComponent(terme)}` : "/boutique");
  };

  return (
    <>
      {/* Bandeau défilant : rappelle les avantages sans occuper de place. */}
      <div className="invert-block overflow-hidden py-2.5">
        <div className="marquee marquee--fast">
          {[0, 1].map((copy) => (
            <div className="marquee__track" key={copy} aria-hidden={copy === 1}>
              {TICKER.map((item) => (
                <span key={`${copy}-${item}`} className="label-sm whitespace-nowrap">
                  {item}
                  <span className="ml-12 opacity-40">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 transition-[transform,background-color,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          hidden && !menuOpen ? "-translate-y-full" : "translate-y-0"
        } ${
          scrolled || menuOpen
            ? "border-b border-[color:var(--color-hairline)] bg-[color:var(--color-paper)]/92 backdrop-blur-md"
            : "border-b border-transparent"
        }`}
      >
        <div className="shell flex h-[68px] items-center justify-between gap-6">
          <Link href="/" className="shrink-0" aria-label="NATURAL BRUTAL — accueil">
            <Logo size="sm" variant="wordmark" />
          </Link>

          <nav className="hidden items-center gap-9 lg:flex" aria-label="Navigation principale">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`label link-sweep ${
                  pathname === item.href.split("?")[0] ? "opacity-100" : "opacity-70"
                } transition-opacity hover:opacity-100`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setSearchOpen((value) => !value)}
              className="label opacity-70 transition-opacity hover:opacity-100"
              aria-label="Rechercher une pièce"
              aria-expanded={searchOpen}
            >
              <SearchIcon />
            </button>

            <Link
              href={user ? "/compte" : "/connexion"}
              className="label hidden opacity-70 transition-opacity hover:opacity-100 sm:block"
              aria-label={user ? "Mon compte" : "Se connecter"}
            >
              <UserIcon />
            </Link>

            <button
              type="button"
              onClick={open}
              className="relative opacity-80 transition-opacity hover:opacity-100"
              aria-label={`Panier — ${cart.count} article${cart.count > 1 ? "s" : ""}`}
            >
              <BagIcon />
              {cart.count > 0 && <span className="badge-count">{cart.count}</span>}
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="flex h-6 w-6 flex-col items-end justify-center gap-[5px] lg:hidden"
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
            >
              <span
                className={`block h-px bg-current transition-all duration-400 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                  menuOpen ? "w-6 translate-y-[3px] rotate-45" : "w-6"
                }`}
              />
              <span
                className={`block h-px bg-current transition-all duration-400 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                  menuOpen ? "w-6 -translate-y-[3px] -rotate-45" : "w-4"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Recherche : le panneau descend sous la barre plutôt que d'ouvrir
            une page intermédiaire. La loupe ne mène plus « quelque part »,
            elle cherche vraiment. */}
        <div
          className={`overflow-hidden border-t border-[color:var(--color-hairline)] bg-[color:var(--color-paper)] transition-[max-height,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            searchOpen ? "max-h-40 opacity-100" : "max-h-0 border-transparent opacity-0"
          }`}
        >
          <form onSubmit={submitSearch} className="shell flex items-center gap-4 py-4" role="search">
            <label htmlFor="recherche-entete" className="sr-only">
              Rechercher une pièce
            </label>
            <input
              ref={searchField}
              id="recherche-entete"
              name="q"
              type="search"
              placeholder="Chercher une pièce, une couleur, un rayon…"
              autoComplete="off"
              tabIndex={searchOpen ? 0 : -1}
              className="min-w-0 flex-1 border-0 border-b border-[color:var(--color-hairline)] bg-transparent pb-2 text-lg outline-none placeholder:text-[color:var(--color-smoke)] focus:border-[color:var(--color-ink)]"
            />
            <button type="submit" className="btn btn-sm shrink-0" tabIndex={searchOpen ? 0 : -1}>
              Chercher
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="label-sm shrink-0 text-[color:var(--color-smoke)] link-sweep"
              tabIndex={searchOpen ? 0 : -1}
            >
              Fermer
            </button>
          </form>
        </div>
      </header>

      {/* Menu mobile plein écran, liens révélés en cascade. */}
      <div
        className={`fixed inset-0 z-40 flex flex-col justify-between bg-[color:var(--color-paper)] pt-[112px] transition-[opacity,visibility] duration-500 lg:hidden ${
          menuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav className="shell flex flex-col" aria-label="Navigation mobile">
          {NAV.map((item, index) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="hairline-b overflow-hidden py-5"
            >
              <span
                className="display-lg block transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  transform: menuOpen ? "none" : "translateY(130%)",
                  transitionDelay: `${120 + index * 60}ms`,
                }}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="shell flex items-center justify-between pb-10">
          <Link
            href={user ? "/compte" : "/connexion"}
            onClick={() => setMenuOpen(false)}
            className="label link-sweep"
          >
            {user ? "Mon compte" : "Connexion"}
          </Link>
          <span className="flex items-center gap-5">
            <a
              href={SHOP.social.instagram}
              target="_blank"
              rel="noreferrer noopener"
              className="label link-sweep"
            >
              Instagram
            </a>
            <a
              href={SHOP.social.tiktok}
              target="_blank"
              rel="noreferrer noopener"
              className="label link-sweep"
            >
              TikTok
            </a>
          </span>
        </div>
      </div>
    </>
  );
}

function BagIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M6 7h12l1.2 13H4.8L6 7Z" />
      <path d="M9 7V5.5a3 3 0 0 1 6 0V7" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M4.5 20c0-4 3.4-6.5 7.5-6.5s7.5 2.5 7.5 6.5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}
