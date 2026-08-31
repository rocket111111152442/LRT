import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DemoBadge } from "@/components/ui/Badge";
import { AgentCard } from "@/components/ui/AgentCard";
import { cantons } from "@/lib/data/cantons";
import { getAgentsByCanton } from "@/lib/data/agents";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  return buildMetadata({ locale, path: "/equipe", title: dict.team.hero.title, description: dict.team.hero.description });
}

export default async function TeamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);

  return (
    <div className="py-10 sm:py-14">
      <Container>
        <Breadcrumbs locale={locale} items={[{ label: dict.common.breadcrumbHome, href: "" }, { label: dict.nav.menu.discoverAgents }]} />
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl text-ink-900 sm:text-4xl">{dict.team.hero.title}</h1>
          <DemoBadge label={dict.meta.demoBadge} />
        </div>
        <p className="mt-3 max-w-2xl text-ink-500">{dict.team.hero.description}</p>

        <div className="mt-12 space-y-12">
          {cantons.map((canton) => {
            const agents = getAgentsByCanton(canton.slug);
            if (agents.length === 0) return null;
            return (
              <div key={canton.slug}>
                <h2 className="mb-5 font-display text-xl text-ink-900">{canton.name}</h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {agents.map((agent) => (
                    <AgentCard key={agent.slug} agent={agent} locale={locale} contactLabel={dict.team.agentCard.contact} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
