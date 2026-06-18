type LrtLogoProps = {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  showText?: boolean;
};

export function LrtLogo({
  className = "",
  markClassName = "",
  textClassName = "text-slate-950",
  showText = true,
}: LrtLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 64 64"
        aria-hidden="true"
        className={`h-10 w-10 shrink-0 ${markClassName}`}
      >
        <rect width="64" height="64" rx="14" fill="#020617" />
        <path
          d="M10 15h14v8H18v18h18v8H10V15Z"
          fill="#F8FAFC"
        />
        <path
          d="M31 15h16c7 0 11 4 11 10 0 4-2 7-6 9l8 15H49l-7-13h-3v13h-8V15Zm8 8v6h7c2 0 4-1 4-3s-2-3-4-3h-7Z"
          fill="#38BDF8"
        />
        <path d="M8 8h16v5H8V8Z" fill="#22C55E" />
        <path d="M42 8h14v5H42V8Z" fill="#38BDF8" />
      </svg>
      {showText ? (
        <span className={`text-xl font-extrabold tracking-normal ${textClassName}`}>
          LRT
        </span>
      ) : null}
    </div>
  );
}
