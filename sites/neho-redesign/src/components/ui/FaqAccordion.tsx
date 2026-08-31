import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd } from "@/lib/seo/jsonld";

/**
 * Accordéon FAQ accessible reposant sur <details>/<summary> natifs :
 * utilisable au clavier et par les lecteurs d'écran sans JavaScript
 * supplémentaire.
 */
export function FaqAccordion({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <div className="divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-cream-50">
      <JsonLd data={faqJsonLd(items)} />
      {items.map((item) => (
        <details key={item.question} className="group px-5 py-4 sm:px-6 sm:py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink-900 marker:content-none">
            {item.question}
            <span aria-hidden="true" className="shrink-0 text-xl text-ivy-600 transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-ink-500">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
