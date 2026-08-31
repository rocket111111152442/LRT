import { Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { FrenchContent } from "@/components/ui/FrenchContent";
import type { Testimonial } from "@/lib/data/types";
import { getCommuneBySlug } from "@/lib/data/communes";
import type { Locale } from "@/lib/i18n/config";

export function TestimonialCard({
  testimonial,
  locale,
  verifiedLabel,
  frenchNotice,
}: {
  testimonial: Testimonial;
  locale: Locale;
  verifiedLabel: string;
  frenchNotice: string;
}) {
  const commune = getCommuneBySlug(testimonial.commune);
  return (
    <figure className="flex h-full flex-col rounded-2xl border border-stone-200 bg-cream-50 p-6 shadow-soft">
      <div className="mb-3 flex items-center gap-1" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={14} className={i < testimonial.rating ? "fill-bronze-500 text-bronze-500" : "text-stone-300"} />
        ))}
      </div>
      <blockquote className="flex-1 text-sm leading-relaxed text-ink-700">
        <FrenchContent locale={locale} notice={frenchNotice} as="span">
          « {testimonial.quote} »
        </FrenchContent>
      </blockquote>
      <figcaption className="mt-5 flex items-center justify-between border-t border-stone-200 pt-4">
        <div>
          <p className="text-sm font-semibold text-ink-900">{testimonial.authorName}</p>
          <p className="text-xs text-ink-500">
            {testimonial.role} — {commune?.name}
          </p>
        </div>
        {testimonial.verified ? <Badge tone="ivy">{verifiedLabel}</Badge> : null}
      </figcaption>
    </figure>
  );
}
