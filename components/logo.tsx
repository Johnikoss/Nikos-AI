import { cn } from "@/lib/utils";

/**
 * Niko brand mark — an "N" that reads as a slanted A + I at second glance.
 *
 * Premium two-tone construction: a thin brand-gradient OUTLINE rim sits under a
 * neutral core drawn in `var(--foreground)`, so the body of the mark always
 * opposes the background — white on dark, black on light — while the gradient
 * reads only as a delicate edge. The gradient ("niko-grad") is defined once
 * globally via <LogoDefs/> in the root layout.
 *
 * Pass `mono` for single-color contexts (everything inherits currentColor).
 */
export function Logo({
  className,
  mono = false,
}: {
  className?: string;
  mono?: boolean;
}) {
  const outline = mono ? "currentColor" : "url(#niko-grad)";
  const body = mono ? "currentColor" : "var(--foreground)";
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="Niko"
    >
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Gradient rim (slightly wider) … */}
        <g stroke={outline} strokeWidth="9">
          <path d="M16 47 L16 18 L38 47" />
          <path d="M43 47 L43 18" />
        </g>
        {/* … neutral core on top, opposing the background. */}
        <g stroke={body} strokeWidth="4.5">
          <path d="M16 47 L16 18 L38 47" />
          <path d="M43 47 L43 18" />
        </g>
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
        <linearGradient id="niko-grad" x1="20" y1="10" x2="44" y2="56" gradientUnits="userSpaceOnUse">
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
        Niko<span className="text-muted-foreground">-ΛI</span>
      </span>
    </span>
  );
}
