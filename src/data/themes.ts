export const themes = [
  { id: "dark", name: "ONE-G Dark" },
  { id: "deep-sea", name: "深海蓝" },
  { id: "tea-blossom", name: "茶花红" },
  { id: "apple", name: "苹果青" },
] as const;
export type ThemeId = (typeof themes)[number]["id"];
export const themeStorageKey = "one-g-theme";
export function isThemeId(value: unknown): value is ThemeId {
  return themes.some(theme => theme.id === value);
}
