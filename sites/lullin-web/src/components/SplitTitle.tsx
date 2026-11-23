import { Fragment } from "react";

/** Titre découpé en lettres, révélées en cascade (flou + montée). */
export function SplitTitle({ text, className }: { text: string; className?: string }) {
  let n = 0;
  const words = text.split(" ");
  return (
    <h2 className={className} aria-label={text}>
      {words.map((word, wi) => (
        <Fragment key={wi}>
          <span className="inline-block whitespace-nowrap" aria-hidden>
            {Array.from(word).map((ch, ci) => {
              const i = n++;
              return (
                <span key={ci} className="split-char" style={{ animationDelay: `${i * 28}ms` }}>
                  {ch}
                </span>
              );
            })}
          </span>
          {wi < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </h2>
  );
}
