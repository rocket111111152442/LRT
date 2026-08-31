import Link from "next/link";
import { AgentAvatar } from "@/components/ui/AgentAvatar";
import type { Agent } from "@/lib/data/types";
import type { Locale } from "@/lib/i18n/config";

export function AgentCard({ agent, locale, contactLabel }: { agent: Agent; locale: Locale; contactLabel: string }) {
  return (
    <Link
      href={`/${locale}/equipe/${agent.slug}`}
      className="group flex flex-col items-center rounded-2xl border border-stone-200 bg-cream-50 p-6 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <AgentAvatar agent={agent} size={80} />
      <h3 className="mt-4 text-base font-semibold text-ink-900">{agent.name}</h3>
      <p className="text-xs text-ink-500">{agent.role}</p>
      <span className="mt-4 text-xs font-semibold uppercase tracking-wide text-ivy-600 group-hover:underline">
        {contactLabel} →
      </span>
    </Link>
  );
}
