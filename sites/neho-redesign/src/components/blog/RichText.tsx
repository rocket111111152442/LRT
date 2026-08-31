import type { RichTextBlock } from "@/lib/data/blog";

export function RichText({ blocks }: { blocks: RichTextBlock[] }) {
  return (
    <div className="space-y-5 text-ink-700">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading": {
            const Tag = block.level === 2 ? "h2" : "h3";
            return (
              <Tag key={block.id} id={block.id} className={block.level === 2 ? "pt-4 font-display text-2xl text-ink-900" : "pt-2 font-display text-xl text-ink-900"}>
                {block.text}
              </Tag>
            );
          }
          case "paragraph":
            return (
              <p key={i} className="leading-relaxed">
                {block.text}
              </p>
            );
          case "list":
            return (
              <ul key={i} className="list-disc space-y-1.5 pl-5 leading-relaxed">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <blockquote key={i} className="rounded-2xl border-l-4 border-ivy-500 bg-ivy-100/40 py-4 pl-5 pr-4 italic text-ink-700">
                {block.text}
                {block.cite ? <footer className="mt-2 text-sm not-italic text-ink-500">— {block.cite}</footer> : null}
              </blockquote>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
