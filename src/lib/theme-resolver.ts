import type { AccessibilityTheme, PreferredThemeId, ThemeId } from "@/data/themes";

export function resolveTheme(preferredTheme: PreferredThemeId, accessibilityTheme: AccessibilityTheme | null): ThemeId {
  return accessibilityTheme ?? preferredTheme;
}
