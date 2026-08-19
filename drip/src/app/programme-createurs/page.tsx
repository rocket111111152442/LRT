import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Marquee } from "@/components/Marquee";
import { lireProgramme } from "@/lib/programme";
import { SHOP } from "@/lib/shop";

export const metadata: Metadata = {
  title: "Portez-le, publiez-le",
  description:
    "Portez votre pièce NATURAL BRUTAL, publiez-la sur Instagram ou TikTok en nous mentionnant, recevez un code de réduction pour votre prochaine commande.",
  alternates: { canonical: "/programme-createurs" },
};

const ETAPES = [
  {
    number: "01",
    title: "Commandez, portez",
    body: "À l'entraînement, à la salle, dans la rue. La pièce doit être portée : c'est tout l'intérêt.",
  },
  {
    number: "02",
    title: "Photographiez",
    body: "Une photo, une story ou une vidéo. Rien de studio : la lumière du gymnase suffit largement.",
  },
  {
    number: "03",
    title: "Publiez et mentionnez-nous",
    body: "Sur Instagram ou TikTok, en identifiant le compte NATURAL BRUTAL dans la publication.",
  },
  {
    number: "04",
    title: "Recevez votre code",
    body: "Écrivez-nous le lien de la publication. Le code part par retour de message.",
  },
];

export default async function ProgrammeCreateursPage() {
  const programme = await lireProgramme();

  return (
    <>
      <PageHeader
        eyebrow="Programme"
        title="Portez-le, publiez-le."
        intro="Vos photos valent mieux que n'importe quelle publicité : elles montrent les pièces sur de vraies personnes, à l'entraînement. Publiez la vôtre, repartez avec une réduction."
      />

      {programme.actif ? (
        <>
          <section className="shell pb-4">
            <div className="reveal border border-[color:var(--color-ink)] p-7 lg:p-10">
              <p className="label mb-4 text-[color:var(--color-smoke)]">
                (Votre récompense)
              </p>
              <p className="display-lg max-w-[20ch]">{programme.recompense}</p>
              <p className="mt-5 max-w-[52ch] text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
                Une publication, un code. Réponse sous {programme.delai} après
                l&apos;envoi de votre lien.
              </p>
            </div>
          </section>

          <Marquee
            invert
            size="lg"
            items={["Portez-le", "Publiez-le", "Récupérez votre code"]}
            separator="—"
          />

          <section className="shell section">
            <p className="label reveal mb-10 text-[color:var(--color-smoke)]">
              (Comment ça marche)
            </p>

            <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-4">
              {ETAPES.map((etape, index) => (
                <article
                  key={etape.number}
                  className="reveal border-t border-[color:var(--color-hairline)] py-7 lg:pr-8"
                  style={{ ["--reveal-delay" as string]: `${index * 90}ms` }}
                >
                  <p className="label-sm mb-5 text-[color:var(--color-smoke)]">
                    {etape.number}
                  </p>
                  <h2 className="mb-3 text-sm font-medium">{etape.title}</h2>
                  <p className="text-sm leading-relaxed text-[color:var(--color-smoke)]">
                    {etape.body}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-12 flex flex-wrap gap-3">
              <a
                href={programme.instagram}
                target="_blank"
                rel="noreferrer noopener"
                className="btn"
              >
                Nous suivre sur Instagram
              </a>
              <a
                href={programme.tiktok}
                target="_blank"
                rel="noreferrer noopener"
                className="btn btn-outline"
              >
                Nous suivre sur TikTok
              </a>
            </div>
          </section>

          <section className="shell section hairline">
            <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-24">
              <div>
                <p className="label reveal mb-6 text-[color:var(--color-smoke)]">
                  (Les règles)
                </p>
                <h2 className="display-lg reveal-mask max-w-[14ch]">
                  <span>Simple et sans piège</span>
                </h2>
              </div>

              <ul className="reveal space-y-5 text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
                <li>
                  <span className="block font-medium">Une pièce achetée chez nous</span>
                  Le code est réservé aux commandes passées sur cette boutique.
                  Gardez votre numéro de commande sous la main.
                </li>
                <li>
                  <span className="block font-medium">La pièce doit se voir</span>
                  Portée, reconnaissable. Une photo du colis fermé ne compte pas.
                </li>
                <li>
                  <span className="block font-medium">Un compte public</span>
                  Sans quoi nous ne pouvons ni vérifier la publication ni la
                  partager.
                </li>
                <li>
                  <span className="block font-medium">Un code par publication</span>
                  Publiez à chaque nouvelle pièce : chaque publication ouvre
                  droit à un nouveau code.
                </li>
                <li>
                  <span className="block font-medium">
                    Nous pouvons repartager votre photo
                  </span>
                  En nous mentionnant, vous nous autorisez à reprendre la
                  publication sur nos comptes, en vous créditant. Dites-le-nous
                  si vous ne le souhaitez pas : le code reste acquis.
                </li>
              </ul>
            </div>
          </section>

          <section className="shell pb-24">
            <div className="hairline flex flex-col items-start gap-5 pt-10">
              <p className="max-w-[54ch] text-sm leading-relaxed text-[color:var(--color-smoke)]">
                Publication faite ? Envoyez-nous le lien avec votre numéro de
                commande, et le code arrive.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href={`mailto:${programme.email}`} className="btn">
                  Envoyer ma publication
                </a>
                <Link href="/boutique" className="btn btn-outline">
                  Voir la collection
                </Link>
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="shell pb-24">
          <div className="hairline flex flex-col items-start gap-5 pt-10">
            <p className="max-w-[54ch] text-sm leading-relaxed text-[color:var(--color-smoke)]">
              Le programme est en pause pour le moment. Suivez {SHOP.name} sur
              les réseaux, il rouvrira là-bas en premier.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={programme.instagram}
                target="_blank"
                rel="noreferrer noopener"
                className="btn"
              >
                Instagram
              </a>
              <a
                href={programme.tiktok}
                target="_blank"
                rel="noreferrer noopener"
                className="btn btn-outline"
              >
                TikTok
              </a>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
