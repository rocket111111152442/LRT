export function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <span
      className={`font-sans text-xs uppercase tracking-[0.25em] ${
        light ? "text-[var(--color-ivory)] opacity-70" : "text-[var(--color-brown)]"
      }`}
    >
      {children}
    </span>
  );
}
