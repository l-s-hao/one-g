"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { isThemeId, themeStorageKey, type ThemeId } from "@/data/themes";

const ThemeContext = createContext<{ theme: ThemeId; setTheme: (theme: ThemeId) => void }>({ theme: "dark", setTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }: { children: ReactNode }) {
  // SSR and the browser's first render are both Dark. Storage is client-only.
  const [theme, updateTheme] = useState<ThemeId>("dark");
  const apply = (value: ThemeId) => {
    document.documentElement.dataset.theme = value;
    updateTheme(value);
  };
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem(themeStorageKey); } catch { /* Storage may be unavailable. */ }
    let active = true;
    Promise.resolve().then(() => { if (active) apply(isThemeId(saved) ? saved : "dark"); });
    const sync = (event: StorageEvent) => {
      if (event.key === themeStorageKey || event.key === null) apply(isThemeId(event.newValue) ? event.newValue : "dark");
    };
    window.addEventListener("storage", sync);
    return () => { active = false; window.removeEventListener("storage", sync); };
  }, []);
  const setTheme = (value: ThemeId) => {
    if (!isThemeId(value)) return;
    apply(value);
    try { localStorage.setItem(themeStorageKey, value); } catch { /* Switching still works without persistence. */ }
  };
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
