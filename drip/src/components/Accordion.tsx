"use client";

import { useState } from "react";

export type AccordionItem = {
  title: string;
  content: React.ReactNode;
};

/**
 * Accordéon en filets, sans carte ni ombre : la ligne se contente de s'ouvrir.
 * La hauteur est animée via `grid-template-rows`, ce qui évite de mesurer le
 * contenu au montage et fonctionne quelle que soit la longueur du texte.
 */
export function Accordion({
  items,
  defaultOpen = 0,
}: {
  items: AccordionItem[];
  defaultOpen?: number | null;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);

  return (
    <div className="flex flex-col">
      {items.map((item, index) => {
        const isOpen = open === index;

        return (
          <div key={item.title} className="hairline-b first:border-t first:border-[color:var(--color-hairline)]">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="label">{item.title}</span>
              <span
                className="relative block h-3 w-3 shrink-0"
                aria-hidden="true"
              >
                <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-current" />
                <span
                  className={`absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isOpen ? "scale-y-0" : "scale-y-100"
                  }`}
                />
              </span>
            </button>

            <div
              className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="pb-6 text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
