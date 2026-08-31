import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AgentCard } from "@/components/ui/AgentCard";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/animation/Reveal";
import { agents } from "@/lib/data/agents";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import type { Locale } from "@/lib/i18n/config";

export function AgentsPreview({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.home.agents;
  const preview = agents.slice(0, 4);

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow={t.eyebrow} title={t.title} description={t.description} />
          <Button href={`/${locale}/equipe`} variant="outline" className="shrink-0">
            {t.ctaAll}
          </Button>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {preview.map((agent, i) => (
            <Reveal key={agent.slug} delay={i * 0.06}>
              <AgentCard agent={agent} locale={locale} contactLabel={dict.team.agentCard.contact} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
