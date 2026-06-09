import { cn } from "@/lib/utils";

/**
 * Nikos brand mark — a bold rounded "N" whose final stroke rises into an upward
 * navigation arrow (direction / momentum). Navy → blue → violet gradient.
 * The gradient ("nikos-grad") is defined once globally via <LogoDefs/> in the
 * root layout, so every instance renders identically with no duplicate ids.
 *
 * Pass `mono` for single-color contexts (inherits currentColor, no gradient).
 */
export function Logo({
  className,
  strokeWidth = 9,
  mono = false,
}: {
  className?: string;
  strokeWidth?: number;
  mono?: boolean;
}) {
  const stroke = mono ? "currentColor" : "url(#nikos-grad)";
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="Nikos"
      fill="none"
    >
      {/* the N, with the right stroke climbing past the top */}
      <path
        d="M16 50 L16 18 L40 50 L40 11"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* upward navigation arrowhead */}
      <path
        d="M30.5 21 L40 11 L49.5 21"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Hidden global <defs> for the brand gradient. Render once in the root layout. */
export function LogoDefs() {
  return (
    <svg width="0" height="0" aria-hidden className="absolute">
      <defs>
        <linearGradient id="nikos-grad" x1="20" y1="8" x2="44" y2="54" gradientUnits="userSpaceOnUse">
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
