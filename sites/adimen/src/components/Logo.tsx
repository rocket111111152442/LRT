import { cx } from '@/lib/utils';

/**
 * Marque typographique ADIMEN.
 *
 * Le signe est une figure géométrique abstraite — trois points relevés et
 * reliés, en écho au travail de recoupement — plutôt qu'un symbole convenu du
 * métier (loupe, empreinte, chapeau).
 */
export default function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cx('inline-flex items-center gap-3', className)}>
      <svg
        viewBox="0 0 32 32"
        className="size-7 shrink-0 text-champagne"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M16 3.5 27.5 24.5H4.5L16 3.5Z"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinejoin="round"
          opacity="0.45"
        />
        <circle cx="16" cy="3.5" r="2.1" fill="currentColor" />
        <circle cx="27.5" cy="24.5" r="1.5" fill="currentColor" opacity="0.75" />
        <circle cx="4.5" cy="24.5" r="1.5" fill="currentColor" opacity="0.75" />
        <circle cx="16" cy="17.5" r="1" fill="currentColor" opacity="0.5" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.4rem] tracking-[0.34em] text-ivoire">ADIMEN</span>
        {!compact && (
          <span className="mt-1 font-mono text-[0.5625rem] tracking-[0.24em] text-brume uppercase">
            Investigations
          </span>
        )}
      </span>
    </span>
  );
}
