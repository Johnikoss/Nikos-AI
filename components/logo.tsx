import { cn } from "@/lib/utils";

/**
 * Niko brand mark — the actual logo artwork (public/logo.png).
 *
 * `mono` is accepted for call-site compatibility but has no effect: the mark is
 * a fixed image rather than a tintable SVG.
 */
export function Logo({
  className,
}: {
  className?: string;
  mono?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="Niko"
      className={cn("shrink-0 object-contain", className)}
    />
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
