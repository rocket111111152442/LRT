import { Container } from "@/components/ui/Container";
import { StatGrid } from "@/components/ui/StatGrid";
import type { Dictionary } from "@/lib/i18n/dictionary-type";

export function KeyStatsSection({ dict }: { dict: Dictionary }) {
  const t = dict.home.stats;
  return (
    <section className="border-y border-stone-200 bg-cream-100/60 py-14">
      <Container>
        <h2 className="mb-8 text-center font-display text-2xl text-ink-900">{t.title}</h2>
        <StatGrid items={t.items} demoLabel={dict.meta.demoBadge} />
      </Container>
    </section>
  );
}
