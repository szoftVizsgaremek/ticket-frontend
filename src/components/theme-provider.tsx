import { useEffect, useState, type ReactNode } from "react";

import {
  applyTheme,
  getSystemTheme,
  ThemeContext,
  type Theme,
} from "@/lib/theme";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(storageKey);

    return stored === "light" || stored === "dark" || stored === "system"
      ? stored
      : defaultTheme;
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(storageKey, theme);
  }, [storageKey, theme]);

  useEffect(() => {
    if (theme !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");

    mediaQuery.addEventListener("change", onChange);

    return () => {
      mediaQuery.removeEventListener("change", onChange);
    };
  }, [theme]);

  function setTheme(nextTheme: Theme) {
    setThemeState(nextTheme);
  }

  function toggleTheme() {
    setThemeState((prev) => {
      if (prev === "system") {
        return getSystemTheme() === "dark" ? "light" : "dark";
      }

      return prev === "dark" ? "light" : "dark";
    });
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}