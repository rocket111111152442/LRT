'use client';

import { useId, useMemo, useState } from 'react';
import { MapPin, Phone } from 'lucide-react';

import { bureaux } from '@/content/site';
import { contourLeman, traceLisse, versScene } from '@/lib/geo';
import { cx, lienPlan, lienTel } from '@/lib/utils';

/* Repère du dessin : le territoire projeté tient dans une boîte de 1000 × 380. */
const LARGEUR = 1000;
const HAUTEUR = 380;
const ECHELLE = 52;
const DECALAGE_X = LARGEUR / 2;
const DECALAGE_Y = HAUTEUR / 2;

type Props = {
  /** Version figée : ni interaction ni animation. Sert de repli aux scènes 3D. */
  statique?: boolean;
  className?: string;
};

export default function CarteImplantations({ statique = false, className }: Props) {
  const [actif, setActif] = useState<string | null>(null);
  const idGradient = useId().replace(/:/g, '');

  const lac = useMemo(() => traceLisse(contourLeman(ECHELLE, DECALAGE_X, DECALAGE_Y)), []);

  const points = useMemo(
    () =>
      bureaux.map((bureau) => {
        const [x, z] = versScene(bureau.lng, bureau.lat);
        return { bureau, x: x * ECHELLE + DECALAGE_X, y: z * ECHELLE + DECALAGE_Y };
      }),
    [],
  );

  /* Liaisons entre implantations successives, plus la diagonale Genève – Montreux. */
  const liaisons = useMemo(() => {
    const traces: { d: string; longueur: number }[] = [];
    const paires: [number, number][] = [
      [0, 1],
      [1, 2],
      [2, 3],
      [0, 2],
    ];

    for (const [i, j] of paires) {
      const a = points[i];
      const b = points[j];
      if (!a || !b) continue;
      // Arc léger : la courbure évite la ligne droite, trop schématique.
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2 - Math.abs(b.x - a.x) * 0.16 - 18;
      traces.push({
        d: `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`,
        longueur: Math.hypot(b.x - a.x, b.y - a.y) * 1.15,
      });
    }
    return traces;
  }, [points]);

  const bureauActif = bureaux.find((b) => b.id === actif) ?? null;

  return (
    <div className={cx('relative', className)}>
      <svg
        viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`}
        className="w-full"
        role={statique ? 'presentation' : 'img'}
        aria-label={
          statique
            ? undefined
            : "Carte de l'arc lémanique situant les bureaux de Genève, Lausanne, Montreux et Sion"
        }
        aria-hidden={statique || undefined}
      >
        <defs>
          <radialGradient id={`lueur-${idGradient}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c9ab72" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#c9ab72" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`eau-${idGradient}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#12181f" />
            <stop offset="100%" stopColor="#1e262f" />
          </linearGradient>
        </defs>

        {/* Trame de fond */}
        <g opacity="0.28">
          {Array.from({ length: 21 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={i * 50}
              y1="0"
              x2={i * 50}
              y2={HAUTEUR}
              stroke="#2c3742"
              strokeWidth="1"
            />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <line
              key={`h${i}`}
              x1="0"
              y1={i * 50}
              x2={LARGEUR}
              y2={i * 50}
              stroke="#2c3742"
              strokeWidth="1"
            />
          ))}
        </g>

        {/* Le Léman */}
        <path
          d={lac}
          fill={`url(#eau-${idGradient})`}
          stroke="#3c4a57"
          strokeWidth="1.5"
          className={statique ? undefined : 'transition-[stroke] duration-500'}
        />
        <path d={lac} fill="none" stroke="#c9ab72" strokeWidth="1" opacity="0.34" />

        {/* Liaisons — le tracé se dessine à l'apparition */}
        <g fill="none" stroke="#c9ab72" strokeOpacity="0.34" strokeWidth="1.2">
          {liaisons.map((liaison, index) => (
            <path
              key={index}
              d={liaison.d}
              strokeDasharray={statique ? undefined : liaison.longueur}
              strokeDashoffset={statique ? undefined : liaison.longueur}
              style={
                statique
                  ? undefined
                  : {
                      animation: `tracer 1600ms var(--ease-net) ${400 + index * 220}ms forwards`,
                    }
              }
            />
          ))}
        </g>

        {/* Implantations */}
        {points.map(({ bureau, x, y }) => {
          const estActif = actif === bureau.id;
          return (
            <g
              key={bureau.id}
              className={statique ? undefined : 'cursor-pointer'}
              onMouseEnter={statique ? undefined : () => setActif(bureau.id)}
              onMouseLeave={statique ? undefined : () => setActif(null)}
              onFocus={statique ? undefined : () => setActif(bureau.id)}
              onBlur={statique ? undefined : () => setActif(null)}
              tabIndex={statique ? undefined : 0}
              role={statique ? undefined : 'button'}
              aria-label={statique ? undefined : `Bureau de ${bureau.ville}`}
              aria-pressed={statique ? undefined : estActif}
            >
              <circle cx={x} cy={y} r="44" fill={`url(#lueur-${idGradient})`} />
              <circle
                cx={x}
                cy={y}
                r={estActif ? 17 : 13}
                fill="none"
                stroke="#c9ab72"
                strokeWidth="1"
                opacity={estActif ? 0.9 : 0.45}
                className={statique ? undefined : 'transition-all duration-300'}
              />
              <circle
                cx={x}
                cy={y}
                r={bureau.principal ? 5 : 4}
                fill={estActif || bureau.principal ? '#f0dcb4' : '#c9ab72'}
                className={statique ? undefined : 'transition-colors duration-300'}
              />
              <text
                x={x}
                y={y - 28}
                textAnchor="middle"
                className="font-mono"
                fontSize="13"
                letterSpacing="2.4"
                fill={estActif ? '#eceff3' : '#b4bec8'}
                style={statique ? undefined : { transition: 'fill 300ms' }}
              >
                {bureau.ville.toUpperCase()}
              </text>
              {/* Cible tactile élargie, invisible */}
              {!statique && <circle cx={x} cy={y} r="30" fill="transparent" />}
              <title>{`${bureau.ville} — ${bureau.rue}, ${bureau.npa} ${bureau.localite}`}</title>
            </g>
          );
        })}
      </svg>

      {/* Fiche du bureau survolé — l'information n'est jamais portée par la seule couleur */}
      {!statique && (
        <div
          className="verre mt-6 rounded-[var(--radius-carte)] p-6 transition-opacity duration-300 lg:absolute lg:right-0 lg:bottom-0 lg:mt-0 lg:w-[21rem]"
          aria-live="polite"
        >
          {bureauActif ? (
            <>
              <h3 className="font-display text-t4 text-ivoire">{bureauActif.ville}</h3>
              <p className="mt-2 text-[0.875rem] leading-relaxed text-brume">{bureauActif.intro}</p>
              <div className="mt-4 flex flex-col gap-2 text-[0.875rem]">
                <a
                  href={lienPlan(
                    `${bureauActif.rue}, ${bureauActif.npa} ${bureauActif.localite}, Suisse`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-argent transition-colors hover:text-champagne"
                >
                  <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-champagne" />
                  <span>
                    {bureauActif.rue}, {bureauActif.npa} {bureauActif.localite}
                  </span>
                </a>
                {bureauActif.telephone && bureauActif.telephoneAffiche && (
                  <a
                    href={lienTel(bureauActif.telephone)}
                    className="flex items-center gap-2 text-argent transition-colors hover:text-champagne"
                  >
                    <Phone aria-hidden="true" className="size-3.5 shrink-0 text-champagne" />
                    <span>{bureauActif.telephoneAffiche}</span>
                  </a>
                )}
              </div>
            </>
          ) : (
            <p className="text-[0.875rem] leading-relaxed text-brume">
              Survolez ou sélectionnez une implantation pour afficher son adresse et son numéro
              direct. Les quatre bureaux couvrent l’arc lémanique et le Valais.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
