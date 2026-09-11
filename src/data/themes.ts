export const themes = [
  { id: "dark", name: "ONE-G Dark", colors: ["#000000", "#FFFFFF"] },
  { id: "deep-sea", name: "Deep Sea / 深海蓝", colors: ["#122E8A", "#F5EFEA"] },
  { id: "tea-blossom", name: "Tea Blossom / 茶花红", colors: ["#E72D48", "#F1DDDF"] },
  { id: "apple", name: "Apple / 苹果青", colors: ["#73AE52", "#FBF1D7"] },
] as const;
export type ThemeId = (typeof themes)[number]["id"];
export function isThemeId(value: unknown): value is ThemeId {
  return themes.some(theme => theme.id === value);
}
