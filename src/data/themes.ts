export const displayModes = [
  { id: "standard", name: "标准显示" },
  { id: "eye-comfort", name: "护眼模式" },
  { id: "night", name: "夜间模式" },
  { id: "color-vision-safe", name: "色觉友好" },
] as const;
export type DisplayMode = typeof displayModes[number]["id"];
export type SpecialDisplayMode = Exclude<DisplayMode, "standard">;
export function isDisplayMode(value: unknown): value is DisplayMode { return displayModes.some(mode => mode.id === value); }
export const displayModeName = (mode: DisplayMode) => displayModes.find(item => item.id === mode)!.name;
