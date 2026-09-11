import { isAccessibilityTheme, type AccessibilityTheme } from "@/data/themes";

export const accessibilityThemeKey = "one-g-accessibility-theme";
const legacyKey = "one-g-home-accessibility";
export function loadAccessibilityTheme(): AccessibilityTheme | null {
  try {
    const stored = localStorage.getItem(accessibilityThemeKey);
    if (stored !== null) return isAccessibilityTheme(stored) ? stored : null;
    // One-time upgrade of the previous homepage setting; never keep two stores active.
    const old = localStorage.getItem(legacyKey);
    const migrated = old === "mono-invert" ? "monochrome" : old === "color-vision-safe" ? old : null;
    if (old !== null) {
      saveAccessibilityTheme(migrated);
      localStorage.removeItem(legacyKey);
    }
    return migrated;
  } catch { return null; }
}
export function saveAccessibilityTheme(value: AccessibilityTheme | null) {
  try {
    // An explicit null prevents a legacy setting from re-enabling after Standard.
    localStorage.setItem(accessibilityThemeKey, value ?? "null");
    localStorage.removeItem(legacyKey);
  } catch { /* In-memory selection remains usable when storage is blocked. */ }
}
