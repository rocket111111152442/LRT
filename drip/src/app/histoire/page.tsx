import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Marquee } from "@/components/Marquee";
import { NewsletterForm } from "@/components/NewsletterForm";

export const metadata: Metadata = {
  title: "L'atelier",
  description:
    "NATURAL BRUTAL : vêtements pour les sports de combat et la salle, fabriqués à la commande.",
};

const CHAPTERS = [
  {
    number: "01",
    title: "Du matériel, pas du style",
    body: "On habille l'entraînement. Le sol, le sac, les séries. Une pièce qui gêne le mouvement ne sert à rien.",
  },
  {
    number: "02",
    title: "Le nom",
    body: "Naturel : des matières franches et des coupes simples. Brutal : ce que le sport fait subir aux vêtements.",
  },
  {
    number: "03",
    title: "Fabriqué à la commande",
    body: "Rien n'est produit d'avance. La fabrication démarre quand la commande tombe : comptez deux à cinq jours avant l'expédition. C'est plus long, mais rien n'est fabriqué pour rien — pas de stock qui dort, pas d'invendus détruits, pas de pollution pour des pièces que personne n'achètera.",
  },
];

export default function AtelierPage() {
  return (
    <>
      <PageHeader
        eyebrow="L'atelier"
        title="Fait pour l'entraînement."
        intro="NATURAL BRUTAL, c'est deux personnes et des vêtements pour les sports de combat et la salle. Pas de collection de quarante références, pas de discours."
      />

      <Marquee
        invert
        size="lg"
        items={["Naturel", "Brutal", "Rien entre les deux"]}
        separator="—"
      />

      <section className="section shell">
        <div className="flex flex-col">
          {CHAPTERS.map((chapter, index) => (
            <article
              key={chapter.number}
              className="hairline-b grid gap-6 py-12 first:border-t first:border-[color:var(--color-hairline)] lg:grid-cols-[auto_1fr_1.3fr] lg:gap-16"
            >
              <span
                className="display reveal text-[3rem] leading-none opacity-25 lg:text-[4rem]"
                style={{ ["--reveal-delay" as string]: `${index * 80}ms` }}
              >
                {chapter.number}
              </span>

              <h2 className="display-lg reveal max-w-[14ch]">{chapter.title}</h2>

              <p
                className="reveal max-w-[60ch] text-pretty text-base leading-relaxed text-[color:var(--color-ink-soft)]"
                style={{ ["--reveal-delay" as string]: "120ms" }}
              >
                {chapter.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="section shell">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-24">
          <div>
            <h2 className="display-xl max-w-[13ch]">
              <span className="reveal-mask">
                <span>Une question ?</span>
              </span>
              <span className="reveal-mask" style={{ ["--reveal-delay" as string]: "90ms" }}>
                <span>Écrivez-nous.</span>
              </span>
            </h2>

            <p className="reveal mt-8 max-w-[46ch] text-sm leading-relaxed text-[color:var(--color-smoke)]">
              Taille, matière, délai, commande en cours. C&apos;est l&apos;un de
              nous deux qui répond, pas une plateforme de support.
            </p>

            <div className="reveal mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className="btn">
                Nous écrire
              </Link>
              <Link href="/faq" className="btn btn-outline">
                Questions fréquentes
              </Link>
            </div>
          </div>

          <div className="reveal self-end">
            <p className="label mb-4 text-[color:var(--color-smoke)]">
              Être prévenu des sorties
            </p>
            <NewsletterForm source="atelier" />
          </div>
        </div>
      </section>
    </>
  );
}
