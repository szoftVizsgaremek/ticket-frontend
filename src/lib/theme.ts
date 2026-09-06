import { createContext } from "react";

export type Theme = "light" | "dark" | "system";

export interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeProviderState | undefined>(
  undefined
);

export function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(theme: Theme) {
  const dark =
    theme === "dark" || (theme === "system" && getSystemTheme() === "dark");

  document.documentElement.classList.toggle("dark", dark);
}