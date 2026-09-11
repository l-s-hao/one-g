import { isPreferredThemeId, type PreferredThemeId } from "@/data/themes";

export const userThemeKey = (userId: string) => `one-g-theme:${userId}`;

// Replace this storage adapter with /api/me/preferences when authenticated
// server sessions are available. Never read the legacy anonymous theme key.
export function loadUserTheme(userId: string): PreferredThemeId {
  try {
    const value = localStorage.getItem(userThemeKey(userId));
    // Retired IDs are recognized only for migration, never exposed as ThemeId.
    if (value === "deep-sea" || value === "tea-blossom" || value === "apple" || value === "color-vision-safe") {
      saveUserTheme(userId, "dark");
      return "dark";
    }
    return isPreferredThemeId(value) ? value : "dark";
  } catch {
    return "dark";
  }
}

export function saveUserTheme(userId: string, theme: PreferredThemeId) {
  try { localStorage.setItem(userThemeKey(userId), theme); } catch {
    // Theme changes still work for this session when storage is unavailable.
  }
}
