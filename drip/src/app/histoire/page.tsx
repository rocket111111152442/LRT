import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Marquee } from "@/components/Marquee";
import { NewsletterForm } from "@/components/NewsletterForm";

export const metadata: Metadata = {
  title: "Le studio",
  description:
    "DRIP : un studio qui dessine des casquettes en noir et blanc, produites en petites séries et fabriquées à la commande en Europe.",
};

const CHAPTERS = [
  {
    number: "01",
    title: "Une contrainte, pas une palette",
    body: "Le noir et le blanc ne sont pas une économie de moyens : c'est une contrainte qu'on s'impose. Sans couleur pour rattraper une forme bancale, tout se joue sur la coupe, la hauteur de la calotte, la courbe de la visière et la densité du fil. C'est plus dur à réussir, et ça se voit quand c'est réussi.",
  },
  {
    number: "02",
    title: "Fabriqué après l'achat",
    body: "Chaque pièce est confectionnée une fois la commande passée, dans des ateliers partenaires en Europe. Conséquence directe : aucun stock à écouler, aucune promotion de fin de saison pour liquider des invendus, et un délai de deux à cinq jours ouvrés avant expédition. On préfère être honnêtes sur le délai plutôt que rapides sur du stock mort.",
  },
  {
    number: "03",
    title: "Des séries qui finissent",
    body: "Une série sort, elle vit, elle s'arrête. Certaines reviennent, la plupart non. Ce n'est pas une tactique de rareté artificielle : c'est ce qui nous permet de continuer à dessiner au lieu de gérer un catalogue de quarante références qui se ressemblent.",
  },
];

const FACTS = [
  { label: "Fondé en", value: "2026" },
  { label: "Production", value: "Europe" },
  { label: "Couleurs", value: "02" },
  { label: "Stock dormant", value: "00" },
];

export default function HistoirePage() {
  return (
    <>
      <PageHeader
        eyebrow="Le studio"
        title="Deux couleurs, une obsession."
        intro="DRIP est un petit studio. On dessine des casquettes, on les fait produire à l'unité, et on les envoie. Il n'y a pas d'histoire de garage à raconter — juste une manière de travailler qu'on assume."
      />

      <Marquee
        invert
        size="lg"
        items={["Noir", "Blanc", "Rien d'autre"]}
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
                <p className="display text-[clamp(2.5rem,5vw,4rem)] leading-none">{fact.value}</p>
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
                <span>On répond vite.</span>
              </span>
            </h2>

            <p className="reveal mt-8 max-w-[46ch] text-sm leading-relaxed text-[color:var(--color-smoke)]">
              Taille, délai, retour, commande en cours : écrivez-nous, c&apos;est
              une vraie personne qui lit.
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
            <NewsletterForm source="histoire" />
          </div>
        </div>
      </section>
    </>
  );
}
