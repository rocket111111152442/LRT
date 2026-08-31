import Link from "next/link";
import { Logo } from "./Logo";
import { Container } from "@/components/ui/Container";
import { primaryNav, secondaryNav, footerLocalities } from "@/config/nav";
import { offices, site } from "@/config/site";

export function Footer() {
  const year = new Date().getFullYear();
  const prestations = primaryNav.flatMap((g) => g.columns.flatMap((c) => c.links));

  return (
    <footer className="border-t border-pine-line bg-pine text-paper">
      <Container className="py-20 lg:py-24">
        <div className="grid grid-cols-2 gap-x-8 gap-y-14 lg:grid-cols-12">
          <div className="col-span-2 lg:col-span-4">
            <Logo inverse />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-paper/65">
              {site.description}
            </p>
            <p className="mt-8 text-[0.6875rem] uppercase tracking-[0.18em] text-paper/45">
              Expertise immobilière depuis {site.foundedContext}
            </p>
          </div>

          <FooterColumn title="Prestations">
            {prestations.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Agence">
            {secondaryNav.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Localités">
            {footerLocalities.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <div className="col-span-2 space-y-8 lg:col-span-3">
            {offices.map((office) => (
              <div key={office.id}>
                <p className="text-[0.6875rem] uppercase tracking-[0.18em] text-paper/45">{office.label}</p>
                <address className="mt-2 text-sm not-italic leading-relaxed text-paper/75">
                  {office.street}
                  <br />
                  {office.postalCode} {office.city}
                  <br />
                  <a href={`tel:${office.phone}`} className="text-paper transition-colors hover:text-clay-soft">
                    {office.phoneDisplay}
                  </a>
                  <br />
                  <a href={`mailto:${office.email}`} className="text-paper transition-colors hover:text-clay-soft">
                    {office.email}
                  </a>
                </address>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-pine-line pt-8 text-xs text-paper/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.legalName}. Tous droits réservés.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <FooterLink href="/mentions-legales">Mentions légales</FooterLink>
            <FooterLink href="/conditions-generales">Conditions générales</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
          </div>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="lg:col-span-2">
      <p className="text-[0.6875rem] uppercase tracking-[0.18em] text-paper/45">{title}</p>
      <ul className="mt-4 space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-paper/70 transition-colors hover:text-paper">
        {children}
      </Link>
    </li>
  );
}
