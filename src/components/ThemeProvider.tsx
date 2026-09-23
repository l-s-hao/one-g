"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { isDisplayMode, type DisplayMode, type SpecialDisplayMode } from "@/data/themes";
import { displayPreferenceKey, loadDisplayPreference, saveDisplayPreference } from "@/lib/user-preferences";
import { resolveDisplayMode, toggleDisplayMode } from "@/lib/theme-resolver";
import { useAuth } from "./AuthProvider";

interface ThemeState {
  displayMode: DisplayMode;
  ready: boolean;
  setDisplayMode: (mode: DisplayMode) => boolean;
  setModeEnabled: (mode: SpecialDisplayMode, enabled: boolean) => void;
}
type Preference = { userId?: string; mode: DisplayMode };
const ThemeContext = createContext<ThemeState | null>(null);
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme requires ThemeProvider");
  return context;
};

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const { currentUser, authReady } = useAuth();
  const userId = currentUser?.id;
  // SSR and the first hydration render both start with no restored preference.
  // Browser storage is read only below, after authentication has settled.
  const [preference, updatePreference] = useState<Preference | null>(null);
  const committed = useRef<Preference | null>(null);
  const ready = authReady && preference !== null && preference.userId === userId;
  // All modes remain active on logout; account switches still restore their own preference.
  const displayMode = resolveDisplayMode(
    authReady && (preference?.userId === userId || (!userId && preference?.userId)) ? preference?.mode : "standard",
  );
  useLayoutEffect(() => { document.documentElement.dataset.theme = displayMode; }, [displayMode]);
  useEffect(() => {
    if (!authReady) return;
    let active = true;
    const load = (logoutTransition = false) => {
      if (!active) return;
      const previous = committed.current;
      const mode = logoutTransition && previous?.userId && !userId
        ? resolveDisplayMode(previous.mode) : loadDisplayPreference(userId);
      if (logoutTransition && previous?.userId && !userId) saveDisplayPreference(mode, undefined);
      const next = { userId, mode };
      committed.current = next; updatePreference(next);
    };
    void Promise.resolve().then(() => load(true));
    const sync = (event: StorageEvent) => { if (event.key === displayPreferenceKey(userId) || event.key === null) load(); };
    window.addEventListener("storage", sync);
    return () => { active = false; window.removeEventListener("storage", sync); };
  }, [userId, authReady]);
  const setDisplayMode = (mode: DisplayMode) => {
    if (!ready || !isDisplayMode(mode)) return false;
    const next = { userId, mode };
    saveDisplayPreference(mode, userId);
    committed.current = next; updatePreference(next);
    return true;
  };
  const setModeEnabled = (mode: SpecialDisplayMode, enabled: boolean) => {
    if (!enabled && displayMode !== mode) return;
    setDisplayMode(toggleDisplayMode(displayMode, mode, enabled));
  };
  return <ThemeContext.Provider value={{ displayMode, ready, setDisplayMode, setModeEnabled }}>{children}</ThemeContext.Provider>;
}
