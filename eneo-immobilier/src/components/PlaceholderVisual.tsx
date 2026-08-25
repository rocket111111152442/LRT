const variants = {
  ink: "from-ink via-[#1c1d19] to-forest",
  forest: "from-forest via-[#233427] to-ink",
  stone: "from-stone via-[#726f66] to-ink",
  gold: "from-[#4a4023] via-forest to-ink",
} as const;

export type PlaceholderTone = keyof typeof variants;

export default function PlaceholderVisual({
  tone = "ink",
  mark,
  className = "",
}: {
  tone?: PlaceholderTone;
  mark?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-gradient-to-br ${variants[tone]} ${className}`}
    >
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(246,244,239,0.6) 0px, rgba(246,244,239,0.6) 1px, transparent 1px, transparent 64px), repeating-linear-gradient(0deg, rgba(246,244,239,0.4) 0px, rgba(246,244,239,0.4) 1px, transparent 1px, transparent 64px)",
        }}
      />
      {mark && (
        <span className="pointer-events-none absolute -bottom-[6%] -right-[2%] select-none font-display text-[42%] italic leading-none text-ivory/10">
          {mark}
        </span>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent" />
    </div>
  );
}
