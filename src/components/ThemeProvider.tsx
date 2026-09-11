"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { isPreferredThemeId, isAccessibilityTheme, type PreferredThemeId, type AccessibilityTheme, type ThemeId } from "@/data/themes";
import { loadUserTheme, saveUserTheme, userThemeKey } from "@/lib/user-preferences";
import { accessibilityThemeKey, loadAccessibilityTheme, saveAccessibilityTheme } from "@/lib/accessibility-preferences";
import { useAuth } from "./AuthProvider";

interface ThemeState {
  preferredTheme: PreferredThemeId;
  accessibilityTheme: AccessibilityTheme | null;
  effectiveTheme: ThemeId;
  setPreferredTheme: (value: PreferredThemeId) => void;
  setAccessibilityTheme: (value: AccessibilityTheme | null) => void;
}
const ThemeContext = createContext<ThemeState | null>(null);
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme requires ThemeProvider");
  return context;
};

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const pathname = usePathname();
  const userId = currentUser?.id;
  const [preference, updatePreference] = useState<{ userId: string; theme: PreferredThemeId } | null>(null);
  const [accessibilityTheme, updateAccessibilityTheme] = useState<AccessibilityTheme | null>(null);
  // Server and first client render are Dark. Accessibility persists across logout.
  const preferredTheme = userId && preference?.userId === userId ? preference.theme : "dark";
  const effectiveTheme = accessibilityTheme ?? preferredTheme;
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = pathname === "/" && !accessibilityTheme ? "dark" : effectiveTheme;
  }, [effectiveTheme, accessibilityTheme, pathname]);
  useEffect(() => {
    let active = true;
    const load = () => { if (active) updateAccessibilityTheme(loadAccessibilityTheme()); };
    Promise.resolve().then(load);
    const sync = (event: StorageEvent) => { if (event.key === accessibilityThemeKey || event.key === null) load(); };
    window.addEventListener("storage", sync);
    return () => { active = false; window.removeEventListener("storage", sync); };
  }, []);
  useEffect(() => {
    if (!userId) return;
    let active = true;
    const load = () => { if (active) updatePreference({ userId, theme: loadUserTheme(userId) }); };
    Promise.resolve().then(load);
    const sync = (event: StorageEvent) => { if (event.key === userThemeKey(userId) || event.key === null) load(); };
    window.addEventListener("storage", sync);
    return () => { active = false; window.removeEventListener("storage", sync); };
  }, [userId]);
  const setPreferredTheme = (value: PreferredThemeId) => {
    if (!userId || !isPreferredThemeId(value)) return;
    saveUserTheme(userId, value);
    updatePreference({ userId, theme: value });
  };
  const setAccessibilityTheme = (value: AccessibilityTheme | null) => {
    if (value !== null && !isAccessibilityTheme(value)) return;
    saveAccessibilityTheme(value);
    updateAccessibilityTheme(value);
  };
  return <ThemeContext.Provider value={{ preferredTheme, accessibilityTheme, effectiveTheme, setPreferredTheme, setAccessibilityTheme }}>{children}</ThemeContext.Provider>;
}
