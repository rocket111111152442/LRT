import { Camera, View, Ruler, Share2, LineChart, BellRing } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/animation/Reveal";
import type { Dictionary } from "@/lib/i18n/dictionary-type";

const icons = [Camera, View, Ruler, Share2, LineChart, BellRing];

export function DigitalToolsSection({ dict }: { dict: Dictionary }) {
  const t = dict.home.digitalTools;

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow={t.eyebrow} title={t.title} description={t.description} align="center" className="mx-auto" />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {t.items.map((item, i) => {
            const Icon = icons[i % icons.length] ?? Camera;
            return (
              <Reveal key={item.title} delay={i * 0.05} className="rounded-2xl border border-stone-200 bg-cream-100/50 p-6">
                <Icon className="text-ivy-600" size={26} aria-hidden="true" />
                <h3 className="mt-4 text-base font-semibold text-ink-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{item.description}</p>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
