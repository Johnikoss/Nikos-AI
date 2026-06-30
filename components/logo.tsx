import { cn } from "@/lib/utils";

/**
 * Niko brand mark — an "N" that reads as a slanted A + I at second glance.
 *
 * Monochrome construction: the whole mark is drawn as a single bold stroke in
 * `var(--foreground)`, so it always opposes the background — black on light,
 * white on dark — with no gradient.
 *
 * Pass `mono` for contexts that set their own color (inherits currentColor).
 */
export function Logo({
  className,
  mono = false,
}: {
  className?: string;
  mono?: boolean;
}) {
  const color = mono ? "currentColor" : "var(--foreground)";
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="Niko"
    >
      <g fill="none" stroke={color} strokeWidth="8" strokeLinecap="round">
        {/* left leg — full height */}
        <line x1="16" y1="13" x2="16" y2="51" />
        {/* diagonal — top-left to the low bottom-right tail */}
        <line x1="16" y1="13" x2="50" y2="51" />
        {/* right leg — full-height top, stops short so the diagonal tails past it */}
        <line x1="48" y1="13" x2="48" y2="45" />
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
