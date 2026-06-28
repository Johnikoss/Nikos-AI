"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export type Theme = "dark" | "light";

const STORAGE_KEY = "niko-theme";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void; setTheme: (t: Theme) => void }>({
  theme: "dark",
  toggle: () => {},
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

/**
 * App-wide light/dark theme. The `dark` is the default. A small inline script in
 * the root layout applies the stored class before paint (no flash); this provider
 * keeps React state in sync, persists the choice, and re-renders consumers (the
 * toggle + the living background) when the theme flips.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  // The landing ("/") is a dark-only page, so its theme is forced dark regardless
  // of the user's stored preference — and that forced value is never persisted, so
  // the app's chosen theme is preserved when they navigate back to /app.
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const effective: Theme = isLanding ? "dark" : theme;

  // Hydrate from storage (the no-flash script already applied the class pre-paint).
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === "light" || stored === "dark") setThemeState(stored);
  }, []);

  // Apply the effective theme to the document on every change.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", effective === "light");
    root.classList.toggle("dark", effective === "dark");
    root.style.colorScheme = effective;
  }, [effective]);

  // Persist only the user's chosen theme — never the landing's forced dark.
  useEffect(() => {
    if (isLanding) return;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage may be unavailable; the in-memory theme still works */
    }
  }, [theme, isLanding]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggle = useCallback(() => setThemeState((t) => (t === "dark" ? "light" : "dark")), []);

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>
  );
}
