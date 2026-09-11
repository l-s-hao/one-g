import { isThemeId, type ThemeId } from "@/data/themes";

export const userThemeKey = (userId: string) => `one-g-theme:${userId}`;

// Replace this storage adapter with /api/me/preferences when authenticated
// server sessions are available. Never read the legacy anonymous theme key.
export function loadUserTheme(userId: string): ThemeId {
  try {
    const value = localStorage.getItem(userThemeKey(userId));
    // Retired IDs are recognized only for migration, never exposed as ThemeId.
    if (value === "deep-sea" || value === "tea-blossom" || value === "apple") {
      saveUserTheme(userId, "dark");
      return "dark";
    }
    return isThemeId(value) ? value : "dark";
  } catch {
    return "dark";
  }
}

export function saveUserTheme(userId: string, theme: ThemeId) {
  try { localStorage.setItem(userThemeKey(userId), theme); } catch {
    // Theme changes still work for this session when storage is unavailable.
  }
}
