import { isPreferredThemeId, type PreferredThemeId } from "@/data/themes";

export const userThemeKey = (userId: string) => `one-g-theme:${userId}`;

// Replace this storage adapter with /api/me/preferences when authenticated
// server sessions are available. Never read the legacy anonymous theme key.
export function loadUserTheme(userId: string): PreferredThemeId {
  try {
    const value = localStorage.getItem(userThemeKey(userId));
    if (isPreferredThemeId(value)) return value;
    // All retired/unknown IDs converge on the default, without touching other preferences.
    if (value !== null) saveUserTheme(userId, "caribbean-calcite");
    return "caribbean-calcite";
  } catch {
    return "caribbean-calcite";
  }
}

export function saveUserTheme(userId: string, theme: PreferredThemeId) {
  try { localStorage.setItem(userThemeKey(userId), theme); } catch {
    // Theme changes still work for this session when storage is unavailable.
  }
}
