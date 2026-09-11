export const themes = [
  { id: "dark", name: "ONE-G Dark", colors: ["#000000", "#FFFFFF"] },
  { id: "zandan-green", name: "赞丹绿 / Zandan Green", colors: ["#4C614E", "#E5DFD2", "#312E2A"] },
  { id: "aegean-blue", name: "爱琴蓝 / Aegean Blue", colors: ["#306897", "#F1EFE6", "#9B9991"] },
  { id: "falu-red", name: "法鲁红 / Falu Red", colors: ["#7D3127", "#EBE8DD", "#393631"] },
  { id: "burnt-brick", name: "烧砖褐 / Burnt Brick", colors: ["#8B583C", "#EEE7D5", "#4C3327"] },
  { id: "color-vision-safe", name: "Color Vision Safe / 色觉友好", colors: ["#0B1020", "#4EA1FF", "#F2B134", "#F7F7F2"] },
] as const;
export type ThemeId = (typeof themes)[number]["id"];
export function isThemeId(value: unknown): value is ThemeId {
  return themes.some(theme => theme.id === value);
}
