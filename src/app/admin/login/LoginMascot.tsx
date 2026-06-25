"use client";

/**
 * Mascotte de connexion (inspirée du personnage 3D codedevotee, version SVG
 * maison, sans dépendance) :
 *  - les yeux suivent la saisie de l'email ;
 *  - les mains couvrent les yeux quand le champ mot de passe est actif.
 */
export function LoginMascot({
  lookProgress = 0,
  hideEyes = false,
  active = false,
}: {
  lookProgress?: number; // 0 → 1 selon la longueur de l'email
  hideEyes?: boolean; // mot de passe en cours de saisie
  active?: boolean; // un champ a le focus
}) {
  const clamped = Math.max(0, Math.min(1, lookProgress));
  const pupilX = -5 + clamped * 10;
  const pupilY = 2 + clamped * 4;

  return (
    <svg
      viewBox="0 0 200 200"
      className="h-36 w-36 drop-shadow-xl"
      role="img"
      aria-label="Mascotte Qoravo"
    >
      <defs>
        <linearGradient id="mascot-head" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="0.55" stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#22c55e" />
        </linearGradient>
      </defs>

      {/* antenne */}
      <line x1="100" y1="34" x2="100" y2="18" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" />
      <circle cx="100" cy="14" r="6" fill="#22c55e">
        <animate attributeName="r" values="6;7.5;6" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* tête */}
      <rect x="34" y="36" width="132" height="120" rx="38" fill="url(#mascot-head)" />
      <rect x="34" y="36" width="132" height="120" rx="38" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />

      {/* écran visage */}
      <rect x="52" y="58" width="96" height="74" rx="24" fill="#06121f" />

      {/* yeux (cachés si hideEyes) */}
      <g style={{ opacity: hideEyes ? 0 : 1, transition: "opacity .2s ease" }}>
        <g className={active ? "" : "qm-blink"}>
          <circle cx="82" cy="92" r="11" fill="#e0f2fe" />
          <circle cx="118" cy="92" r="11" fill="#e0f2fe" />
          <circle
            cx="82"
            cy="92"
            r="5.5"
            fill="#06121f"
            style={{ transform: `translate(${pupilX}px, ${pupilY}px)`, transition: "transform .15s ease" }}
          />
          <circle
            cx="118"
            cy="92"
            r="5.5"
            fill="#06121f"
            style={{ transform: `translate(${pupilX}px, ${pupilY}px)`, transition: "transform .15s ease" }}
          />
        </g>
      </g>

      {/* bouche */}
      <path
        d={hideEyes ? "M86 116 q14 6 28 0" : "M84 114 q16 10 32 0"}
        fill="none"
        stroke="#38bdf8"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* mains qui montent couvrir les yeux */}
      <g
        style={{
          transform: hideEyes ? "translateY(-58px)" : "translateY(28px)",
          transition: "transform .35s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        <ellipse cx="74" cy="150" rx="20" ry="16" fill="#0ea5e9" />
        <ellipse cx="126" cy="150" rx="20" ry="16" fill="#0ea5e9" />
        <ellipse cx="74" cy="150" rx="20" ry="16" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
        <ellipse cx="126" cy="150" rx="20" ry="16" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
      </g>
    </svg>
  );
}
