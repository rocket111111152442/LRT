/**
 * Bandeau défilant. Le contenu est dupliqué et la piste translate de -100 % :
 * la boucle est continue, sans saut visible à la jonction.
 */
export function Marquee({
  items,
  invert = false,
  reverse = false,
  fast = false,
  separator = "✦",
  size = "md",
}: {
  items: string[];
  invert?: boolean;
  reverse?: boolean;
  fast?: boolean;
  separator?: string;
  size?: "md" | "lg";
}) {
  const classes = [
    "marquee",
    reverse && "marquee--reverse",
    fast && "marquee--fast",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`${invert ? "invert-block" : ""} overflow-hidden py-5`}>
      <div className={classes}>
        {[0, 1].map((copy) => (
          <div className="marquee__track" key={copy} aria-hidden={copy === 1}>
            {items.map((item, index) => (
              <span
                key={`${copy}-${index}`}
                className={`flex shrink-0 items-center gap-12 whitespace-nowrap ${
                  size === "lg" ? "display text-[clamp(2rem,5vw,4.5rem)]" : "label"
                }`}
              >
                {item}
                <span className="opacity-30">{separator}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
