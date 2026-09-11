"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { isThemeId, type ThemeId } from "@/data/themes";
import { loadUserTheme, saveUserTheme, userThemeKey } from "@/lib/user-preferences";
import { useAuth } from "./AuthProvider";

const ThemeContext = createContext<{ theme: ThemeId; setTheme: (theme: ThemeId) => void }>({ theme: "dark", setTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const userId = currentUser?.id;
  const [preference, updatePreference] = useState<{ userId: string; theme: ThemeId } | null>(null);
  // SSR and first client render are Dark; never carry another user's theme.
  const theme = userId && preference?.userId === userId ? preference.theme : "dark";
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    if (!userId) return;
    let active = true;
    const load = () => {
      if (active) updatePreference({ userId, theme: loadUserTheme(userId) });
    };
    Promise.resolve().then(load);
    const sync = (event: StorageEvent) => {
      if (event.key === userThemeKey(userId) || event.key === null) load();
    };
    window.addEventListener("storage", sync);
    return () => { active = false; window.removeEventListener("storage", sync); };
  }, [userId]);
  const setTheme = (value: ThemeId) => {
    if (!userId || !isThemeId(value)) return;
    saveUserTheme(userId, value);
    updatePreference({ userId, theme: value });
  };
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
