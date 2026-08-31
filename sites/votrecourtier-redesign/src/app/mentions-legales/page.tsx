import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { offices, site } from "@/config/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales de votrecourtier.ch SA.",
  alternates: { canonical: "/mentions-legales" },
  robots: { index: true, follow: true },
};

export default function MentionsLegalesPage() {
  return (
    <Section tone="paper" className="pt-40 sm:pt-48">
      <Container narrow>
        <h1 className="font-serif text-3xl text-ink">Mentions légales</h1>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-ink-soft">
          <div>
            <h2 className="font-serif text-lg text-ink">Éditeur du site</h2>
            <p className="mt-2">
              {site.legalName}
              <br />
              Siège social : {offices[0].street}, {offices[0].postalCode} {offices[0].city} (VD)
              <br />
              UID : CHE-462.248.611 — inscrite au registre du commerce du canton de Vaud le 23.08.2016.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-lg text-ink">Contact</h2>
            <p className="mt-2">
              {offices.map((o) => (
                <span key={o.id} className="block">
                  {o.label} — {o.phoneDisplay} — {o.email}
                </span>
              ))}
            </p>
          </div>

          <div>
            <h2 className="font-serif text-lg text-ink">Protection des données</h2>
            <p className="mt-2">
              Les données transmises via les formulaires de ce site (estimation, contact) sont traitées
              conformément à la loi fédérale sur la protection des données (nLPD). Ce site de démonstration ne
              transmet ni ne conserve aucune donnée saisie dans ses formulaires.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-lg text-ink">Propriété intellectuelle</h2>
            <p className="mt-2">
              L&rsquo;ensemble des contenus de ce site (textes, mise en page, identité visuelle) est protégé. Toute
              reproduction sans autorisation est interdite.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-lg text-ink">Nature de ce site</h2>
            <p className="mt-2">
              Cette version de votrecourtier.ch est un concept de refonte privé, non officiel. Les biens
              immobiliers, avis et chiffres non explicitement sourcés qui y figurent sont des données de
              démonstration — voir <code className="text-xs">docs/votrecourtier-audit.md</code> dans le dépôt du
              projet pour le détail des sources.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
