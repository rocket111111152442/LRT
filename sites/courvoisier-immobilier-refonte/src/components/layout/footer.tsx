import Link from "next/link";
import { FOOTER_SERVICE_LINKS, NAV_LINKS, siteConfig } from "@/config/site";
import { agencies } from "@/lib/data/agencies";

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-stone-dark)] bg-[var(--color-ink)] text-[var(--color-ivory)]">
      <div className="mx-auto max-w-(--container-page) px-6 pb-10 pt-20 md:px-10 lg:px-14">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="font-serif text-4xl italic leading-none sm:text-5xl">Courvoisier</p>
            <p className="mt-4 max-w-xs font-sans text-sm leading-relaxed opacity-60">
              {siteConfig.tagline}. Courtage, promotion, conseil et gérance entre
              Lausanne, Rolle et Lonay.
            </p>
            <div className="mt-8 flex gap-5 font-sans text-xs uppercase tracking-[0.2em] opacity-60">
              <a href={siteConfig.social.instagram} className="link-underline" target="_blank" rel="noreferrer">
                Instagram
              </a>
              <a href={siteConfig.social.facebook} className="link-underline" target="_blank" rel="noreferrer">
                Facebook
              </a>
            </div>
          </div>

          <div>
            <p className="mb-4 font-sans text-xs uppercase tracking-[0.25em] opacity-60">Naviguer</p>
            <ul className="space-y-2.5 font-sans text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link-underline">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/estimer" className="link-underline">
                  Estimer
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-4 font-sans text-xs uppercase tracking-[0.25em] opacity-60">Services</p>
            <ul className="space-y-2.5 font-sans text-sm">
              {FOOTER_SERVICE_LINKS.filter((l) => l.href !== "/estimer").map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link-underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 font-sans text-xs uppercase tracking-[0.25em] opacity-60">Agences</p>
            <ul className="space-y-2.5 font-sans text-sm">
              {agencies.map((agency) => (
                <li key={agency.id}>
                  <Link href="/agences" className="link-underline">
                    {agency.city}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 font-sans text-xs uppercase tracking-[0.25em] opacity-60">Contact</p>
            <a href={siteConfig.phoneHref} className="link-underline mt-2 block font-sans text-sm">
              {siteConfig.phone}
            </a>
            <a href={`mailto:${siteConfig.email}`} className="link-underline block font-sans text-sm">
              {siteConfig.email}
            </a>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-[var(--color-ivory)]/10 pt-6 font-sans text-xs opacity-60 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {currentYear} {siteConfig.legalName}</p>
          <div className="flex gap-6">
            <Link href="/mentions-legales" className="link-underline">
              Mentions légales
            </Link>
            <Link href="/confidentialite" className="link-underline">
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
