import { type DisplayMode, isDisplayMode } from "@/data/themes";
import { resolveDisplayMode } from "./theme-resolver";

export const userThemeKey = (userId: string) => `one-g-theme:${userId}`;
export const displayPreferenceKey = (userId?: string) => userId ? userThemeKey(userId) : "one-g-theme";
export const displayPreferenceVersion = 2;

export function saveDisplayPreference(mode: DisplayMode, userId?: string) {
  try { localStorage.setItem(displayPreferenceKey(userId), JSON.stringify({ version: displayPreferenceVersion, displayMode: resolveDisplayMode(mode) })); }
  catch { /* Keep the in-memory selection if storage is unavailable. */ }
}

// Call only after AuthProvider is ready, with its verified current user ID (never an input address).
export function loadDisplayPreference(userId?: string): DisplayMode {
  try {
    const raw = localStorage.getItem(displayPreferenceKey(userId));
    let parsed: unknown;
    try { parsed = raw === null ? null : JSON.parse(raw); } catch { parsed = raw; }
    if (parsed && typeof parsed === "object") {
      const record = parsed as { version?: unknown; displayMode?: unknown };
      const mode = record.version === displayPreferenceVersion ? resolveDisplayMode(record.displayMode) : "standard";
      if (record.version !== displayPreferenceVersion || record.displayMode !== mode) saveDisplayPreference(mode, userId);
      return mode; // Never resurrect an old overlay after a versioned choice (including standard).
    }
    const overlayKey = userId ? `one-g-accessibility-theme:${userId}` : "one-g-accessibility-theme";
    const overlay = localStorage.getItem(overlayKey);
    // An explicit old "null" disables the even older home-only override.
    const effectiveOverlay = overlay ?? (!userId ? localStorage.getItem("one-g-home-accessibility") : null);
    const old = typeof parsed === "string" ? parsed : raw;
    const mode: DisplayMode = effectiveOverlay === "color-vision-safe" ? "color-vision-safe"
      : old === "caribbean-calcite" ? "eye-comfort"
      : isDisplayMode(old) ? resolveDisplayMode(old) : "standard";
    saveDisplayPreference(mode, userId);
    return mode;
  } catch { return "standard"; }
}
