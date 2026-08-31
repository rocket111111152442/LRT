import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail, Phone, Languages, Briefcase } from "lucide-react";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AgentAvatar } from "@/components/ui/AgentAvatar";
import { DemoBadge } from "@/components/ui/Badge";
import { FrenchContent } from "@/components/ui/FrenchContent";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { personJsonLd, realEstateAgentJsonLd } from "@/lib/seo/jsonld";
import { agents, getAgentBySlug } from "@/lib/data/agents";
import { getCantonBySlug } from "@/lib/data/cantons";
import { properties } from "@/lib/data/properties";

export function generateStaticParams() {
  return locales.flatMap((locale) => agents.map((a) => ({ locale, slug: a.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const agent = getAgentBySlug(slug);
  if (!agent) return buildMetadata({ locale, path: `/equipe/${slug}`, title: dict.notFound.title, description: dict.notFound.description, noIndex: true });
  return buildMetadata({ locale, path: `/equipe/${agent.slug}`, title: `${agent.name} — ${agent.role}`, description: agent.bio });
}

export default async function AgentProfilePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const agent = getAgentBySlug(slug);
  if (!agent) notFound();

  const canton = getCantonBySlug(agent.canton);
  const agentProperties = properties.filter((p) => p.agentSlug === agent.slug);

  return (
    <div className="py-10 sm:py-14">
      <Container narrow>
        <JsonLd data={realEstateAgentJsonLd(agent)} />
        <JsonLd data={personJsonLd(agent)} />
        <Breadcrumbs
          locale={locale}
          items={[
            { label: dict.common.breadcrumbHome, href: "" },
            { label: dict.nav.menu.discoverAgents, href: "/equipe" },
            { label: agent.name },
          ]}
        />

        <div className="mt-8 flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <AgentAvatar agent={agent} size={104} />
          <div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="font-display text-2xl text-ink-900 sm:text-3xl">{agent.name}</h1>
              <DemoBadge label={dict.meta.demoBadge} />
            </div>
            <p className="mt-1 text-ink-500">
              {agent.role} — {canton?.name}
            </p>
          </div>
        </div>

        <FrenchContent locale={locale} notice={dict.common.contentInFrench} as="p" className="mt-8 leading-relaxed text-ink-700">
          {agent.bio}
        </FrenchContent>

        <dl className="mt-8 grid gap-4 rounded-2xl border border-stone-200 bg-cream-100/50 p-6 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm text-ink-700">
            <Briefcase size={16} className="text-ivy-600" aria-hidden="true" />
            <dt className="sr-only">Expérience</dt>
            <dd>{agent.yearsExperience} ans d&rsquo;expérience</dd>
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-700">
            <Languages size={16} className="text-ivy-600" aria-hidden="true" />
            <dt className="sr-only">Langues</dt>
            <dd>{agent.languages.join(", ")}</dd>
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-700">
            <Mail size={16} className="text-ivy-600" aria-hidden="true" />
            <dt className="sr-only">E-mail</dt>
            <dd>
              <a href={`mailto:${agent.emailDemo}`} className="hover:underline">
                {agent.emailDemo}
              </a>
            </dd>
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-700">
            <Phone size={16} className="text-ivy-600" aria-hidden="true" />
            <dt className="sr-only">Téléphone</dt>
            <dd>
              <a href={`tel:${agent.phoneDemo.replace(/\s/g, "")}`} className="hover:underline">
                {agent.phoneDemo}
              </a>
            </dd>
          </div>
        </dl>

        {agentProperties.length > 0 ? (
          <div className="mt-12">
            <h2 className="mb-5 font-display text-xl text-ink-900">
              {agent.name} — {agentProperties.length} {dict.team.agentCard.properties}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {agentProperties.map((p) => (
                <PropertyCard key={p.slug} property={p} locale={locale} availabilityLabels={dict.properties.availability} />
              ))}
            </div>
          </div>
        ) : null}
      </Container>
    </div>
  );
}
