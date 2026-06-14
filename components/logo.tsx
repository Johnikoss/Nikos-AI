import { cn } from "@/lib/utils";

/**
 * Nikos brand mark — a rounded-stroke "N" whose right stroke rises into an
 * upward navigation arrow (direction / momentum). Identical geometry and
 * colors to the favicon (app/icon.svg): navy → brand blue → violet gradient.
 * The gradient ("nikos-grad") is defined once globally via <LogoDefs/> in the
 * root layout, so every instance renders identically with no duplicate ids.
 *
 * Pass `mono` for single-color contexts (inherits currentColor, no gradient).
 */
export function Logo({
  className,
  mono = false,
}: {
  className?: string;
  mono?: boolean;
}) {
  const stroke = mono ? "currentColor" : "url(#nikos-grad)";
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="Nikos"
    >
      {/* Same paths as app/icon.svg: the N, then the arrowhead on its right stroke. */}
      <g fill="none" stroke={stroke} strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 47 L19 21 L39 47 L39 16" />
        <path d="M31 24 L39 16 L47 24" />
      </g>
    </svg>
  );
}

/** Hidden global <defs> for the brand gradient. Render once in the root layout. */
export function LogoDefs() {
  return (
    <svg width="0" height="0" aria-hidden className="absolute">
      <defs>
        {/* Same stops/geometry as the favicon gradient (app/icon.svg). */}
        <linearGradient id="nikos-grad" x1="20" y1="10" x2="44" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3B4BA6" />
          <stop offset="0.5" stopColor="#4F7CFF" />
          <stop offset="1" stopColor="#8B6CFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Horizontal lockup: mark + wordmark (matches the provided logo). */
export function LogoLockup({
  className,
  markClass = "h-6 w-6",
}: {
  className?: string;
  markClass?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Logo className={markClass} />
      <span className="text-[16px] font-medium tracking-[0.04em] text-foreground">
        Nikos<span className="text-muted-foreground">-ΛI</span>
      </span>
    </span>
  );
}
