import Link from "next/link";
import { Logo } from "@/components/Logo";
import { NewsletterForm } from "@/components/NewsletterForm";
import { SHOP } from "@/lib/shop";

const COLUMNS = [
  {
    title: "Boutique",
    links: [
      { href: "/boutique", label: "Tout l'équipement" },
      { href: "/boutique?tri=nouveautes", label: "Nouveautés" },
      { href: "/boutique?tri=populaires", label: "Les plus aimées" },
      { href: "/avis", label: "Avis clients" },
    ],
  },
  {
    title: "La marque",
    links: [
      { href: "/histoire", label: "L'atelier" },
      { href: "/contact", label: "Contact" },
      { href: "/faq", label: "Questions fréquentes" },
      { href: "/livraison-retours", label: "Livraison & retours" },
    ],
  },
  {
    title: "Légal",
    links: [
      { href: "/cgv", label: "CGV" },
      { href: "/mentions-legales", label: "Mentions légales" },
      { href: "/confidentialite", label: "Confidentialité" },
      { href: "/cookies", label: "Cookies" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="invert-block">
      <div className="shell">
        <div className="grid gap-14 py-16 lg:grid-cols-[1.2fr_2fr] lg:py-24">
          <div className="reveal">
            <Logo size="lg" variant="lockup" />
            <p className="mt-6 max-w-[34ch] text-sm leading-relaxed text-[color:var(--color-ash)]">
              {SHOP.description}
            </p>

            <div className="mt-10 max-w-sm">
              <p className="label mb-3">Rejoindre la liste</p>
              <p className="mb-4 text-xs text-[color:var(--color-smoke)]">
                Les sorties et les restocks. Rien d&apos;autre.
              </p>
              <NewsletterForm source="footer" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {COLUMNS.map((column, index) => (
              <div key={column.title} className="reveal" style={{ ["--reveal-delay" as string]: `${index * 90}ms` }}>
                <p className="label mb-5 text-[color:var(--color-smoke)]">{column.title}</p>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm link-sweep">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Grand mot de pied de page : signature graphique de la marque.
            L'interligne reste au-dessus de 0.95 et une reserve compense le
            debord d'Anton, sinon `overflow-hidden` tranche le haut des
            capitales. */}
        <div className="hairline overflow-hidden pt-10">
          <p className="display select-none pt-[0.12em] text-center text-[clamp(4rem,19vw,16rem)] leading-[0.95] opacity-[0.13]">
            BRUTAL
          </p>
        </div>

        <div className="hairline flex flex-col gap-4 py-7 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="label-sm text-[color:var(--color-smoke)]">
            © {year} {SHOP.legalName}. Tous droits réservés.
          </p>

          <div className="flex items-center justify-center gap-6">
            <a
              href={SHOP.social.instagram}
              target="_blank"
              rel="noreferrer noopener"
              className="label-sm link-sweep"
            >
              Instagram
            </a>
            <a
              href={SHOP.social.tiktok}
              target="_blank"
              rel="noreferrer noopener"
              className="label-sm link-sweep"
            >
              TikTok
            </a>
            <a href={`mailto:${SHOP.email}`} className="label-sm link-sweep">
              E-mail
            </a>
          </div>

          <p className="label-sm text-[color:var(--color-smoke)]">
            Paiement sécurisé par Stripe
          </p>
        </div>
      </div>
    </footer>
  );
}
