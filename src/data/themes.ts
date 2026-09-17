export const themes = [
  { id: "caribbean-calcite", name: "日间模式", english: "Caribbean Calcite" },
  { id: "night", name: "夜间模式", english: "Night Mode" },
] as const;
export type PreferredThemeId = (typeof themes)[number]["id"];
export function isPreferredThemeId(value: unknown): value is PreferredThemeId { return themes.some(theme => theme.id === value); }
export const accessibilityThemes = [{ id: "color-vision-safe", name: "色觉友好 / Color Vision Safe" }] as const;
export type AccessibilityTheme = (typeof accessibilityThemes)[number]["id"];
export type ThemeId = PreferredThemeId | AccessibilityTheme;
export function isAccessibilityTheme(value: unknown): value is AccessibilityTheme { return value === "color-vision-safe"; }
export function isThemeId(value: unknown): value is ThemeId { return isPreferredThemeId(value) || isAccessibilityTheme(value); }
