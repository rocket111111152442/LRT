"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/commandes", label: "Commandes" },
  { href: "/admin/produits", label: "Produits" },
  { href: "/admin/avis", label: "Avis" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/codes-promo", label: "Codes promo" },
  { href: "/admin/messages", label: "Messages" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      className="border-t border-[color:var(--color-hairline-invert)]"
      aria-label="Navigation de l'administration"
    >
      <div className="shell flex gap-7 overflow-x-auto py-3 no-scrollbar">
        {LINKS.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`label whitespace-nowrap transition-opacity ${
                active ? "opacity-100" : "opacity-50 hover:opacity-100"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
