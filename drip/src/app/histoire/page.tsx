import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Marquee } from "@/components/Marquee";
import { NewsletterForm } from "@/components/NewsletterForm";

export const metadata: Metadata = {
  title: "L'atelier",
  description:
    "NATURAL BRUTAL : une marque de vêtements de combat et de sport lancée par un père et son fils, testée à l'entraînement avant d'être vendue.",
};

const CHAPTERS = [
  {
    number: "01",
    title: "Deux paires de mains",
    body: "NATURAL BRUTAL, c'est un père et un fils. Pas d'équipe marketing, pas de bureau de style, pas d'investisseur à rassurer. On dessine ensemble, on tranche ensemble, et quand on se plante, on n'a personne d'autre à blâmer. C'est plus lent qu'une grosse structure, mais chaque pièce qui sort a été validée par les deux.",
  },
  {
    number: "02",
    title: "Naturel, et brutal quand même",
    body: "Le nom dit exactement ce qu'on cherche. Naturel : des matières franches, des coupes qui suivent le corps au lieu de le contraindre, rien d'inutile. Brutal : ça doit encaisser les prises, les chutes, les séries et les lavages qui s'enchaînent. Les deux ne s'opposent pas, ils se tiennent — c'est même tout l'enjeu.",
  },
  {
    number: "03",
    title: "Éprouvé avant d'être vendu",
    body: "Une pièce ne passe pas en ligne parce que le rendu est joli sur un écran. Elle y passe après avoir été portée à l'entraînement, lavée, reportée, tirée dessus. Si une couture cède, si un tissu gratte au troisième round, si une coupe remonte pendant l'effort, elle retourne au dessin. C'est long, et c'est la seule méthode qu'on connaisse.",
  },
  {
    number: "04",
    title: "Fabriqué à la commande",
    body: "Rien n'est produit d'avance. Votre pièce est confectionnée après votre achat : pas d'invendus à brader en fin de saison, pas de cartons qui dorment. En contrepartie, il y a un délai avant l'expédition. On préfère l'annoncer clairement plutôt que promettre du 24 heures qu'on ne tiendrait pas.",
  },
];

const FACTS = [
  { label: "Fondateurs", value: "02" },
  { label: "Générations", value: "02" },
  { label: "Stock dormant", value: "00" },
  { label: "Intermédiaires", value: "00" },
];

export default function AtelierPage() {
  return (
    <>
      <PageHeader
        eyebrow="L'atelier"
        title="Une marque montée à deux."
        intro="Un père, un fils, et l'envie de faire des vêtements d'entraînement qui tiennent vraiment. Il n'y a pas d'histoire de start-up derrière NATURAL BRUTAL — juste une méthode de travail qu'on assume."
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

      <section className="invert-block section">
        <div className="shell">
          <div className="grid grid-cols-2 gap-px lg:grid-cols-4">
            {FACTS.map((fact, index) => (
              <div
                key={fact.label}
                className="reveal border-t border-[color:var(--color-hairline-invert)] py-8 lg:border-r lg:pr-8 lg:last:border-r-0"
                style={{ ["--reveal-delay" as string]: `${index * 90}ms` }}
              >
                <p className="label-sm mb-4 text-[color:var(--color-smoke)]">{fact.label}</p>
                <p className="display text-[clamp(2.5rem,5vw,4rem)] leading-none">
                  {fact.value}
                </p>
              </div>
            ))}
          </div>
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
                <span>C&apos;est nous au bout.</span>
              </span>
            </h2>

            <p className="reveal mt-8 max-w-[46ch] text-sm leading-relaxed text-[color:var(--color-smoke)]">
              Taille, matière, délai, commande en cours : écrivez-nous. Il n&apos;y
              a pas de plateforme de support, c&apos;est l&apos;un de nous deux qui
              répond.
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
