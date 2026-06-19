type QoravoLogoProps = {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  showText?: boolean;
};

export function QoravoLogo({
  className = "",
  markClassName = "",
  textClassName = "text-slate-950",
  showText = true,
}: QoravoLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 64 64"
        aria-hidden="true"
        className={`h-10 w-10 shrink-0 ${markClassName}`}
      >
        <defs>
          <linearGradient id="qoravo-blue" x1="30" x2="56" y1="38" y2="56">
            <stop stopColor="#38BDF8" />
            <stop offset="1" stopColor="#0EA5E9" />
          </linearGradient>
          <linearGradient id="qoravo-green" x1="9" x2="27" y1="10" y2="10">
            <stop stopColor="#22C55E" />
            <stop offset="1" stopColor="#84CC16" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="14" fill="#020617" />
        <rect x="1" y="1" width="62" height="62" rx="13" fill="none" stroke="#1E293B" />
        <path
          d="M31.5 14c11.9 0 21.5 9.6 21.5 21.5 0 5-1.7 9.6-4.6 13.2l-7-7a11.4 11.4 0 1 0-9.9 5.8h9.7v9.2h-9.7C19.6 56.7 10 47.1 10 35.5S19.6 14 31.5 14Z"
          fill="#F8FAFC"
        />
        <path
          d="M35.5 38.5h10.2L56 52.8H44.6L35.5 42v-3.5Z"
          fill="url(#qoravo-blue)"
        />
        <path d="M9 8h18v5H9V8Z" fill="url(#qoravo-green)" />
        <path d="M40 8h15v5H40V8Z" fill="url(#qoravo-blue)" />
      </svg>
      {showText ? (
        <span className={`text-2xl font-extrabold tracking-normal ${textClassName}`}>
          Qoravo
        </span>
      ) : null}
    </div>
  );
}
