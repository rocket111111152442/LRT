"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/compte", label: "Aperçu" },
  { href: "/compte/commandes", label: "Commandes" },
  { href: "/compte/avis", label: "Mes avis" },
  { href: "/compte/adresses", label: "Adresses" },
  { href: "/compte/favoris", label: "Favoris" },
  { href: "/compte/parametres", label: "Paramètres" },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigation du compte">
      <ul className="flex gap-6 overflow-x-auto no-scrollbar lg:flex-col lg:gap-0">
        {LINKS.map((link) => {
          const active =
            link.href === "/compte"
              ? pathname === "/compte"
              : pathname.startsWith(link.href);

          return (
            <li key={link.href} className="lg:hairline-b lg:first:border-t lg:first:border-[color:var(--color-hairline)]">
              <Link
                href={link.href}
                className={`label block whitespace-nowrap py-2 transition-opacity lg:py-4 ${
                  active ? "opacity-100" : "opacity-55 hover:opacity-100"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span className="flex items-center justify-between gap-3">
                  {link.label}
                  {active && <span className="hidden lg:block">→</span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
