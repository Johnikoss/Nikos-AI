"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

/**
 * Floating dark/light switch pinned to the corner of the site. Glass pill that
 * flips the whole palette (black ⇄ white) and inverts the Niko mark with it.
 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
      className="glass glass-hover fixed bottom-4 right-4 z-50 inline-flex size-10 items-center justify-center rounded-full text-foreground shadow-lg transition-colors"
    >
      <Sun className={`size-[18px] transition-all duration-300 ${isLight ? "scale-100 rotate-0 opacity-100" : "absolute scale-0 -rotate-90 opacity-0"}`} />
      <Moon className={`size-[18px] transition-all duration-300 ${isLight ? "absolute scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"}`} />
    </button>
  );
}
