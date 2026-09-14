import type { AccessibilityTheme, PreferredThemeId, ThemeId } from "@/data/themes";

export function isBrandThemeRoute(pathname: string | null) {
  const route = pathname?.replace(/\/+$/, "") || "/";
  return route === "/" || route === "/about";
}

export function resolveTheme(pathname: string | null, preferredTheme: PreferredThemeId, accessibilityTheme: AccessibilityTheme | null): ThemeId {
  return accessibilityTheme ?? (isBrandThemeRoute(pathname) ? "brand" : preferredTheme);
}
