import { isDisplayMode, type DisplayMode, type SpecialDisplayMode } from "@/data/themes";

export function resolveDisplayMode(value: unknown): DisplayMode {
  return isDisplayMode(value) ? value : "standard";
}
export function toggleDisplayMode(current: DisplayMode, mode: SpecialDisplayMode, enabled: boolean): DisplayMode {
  if (!enabled) return current === mode ? "standard" : current;
  return mode;
}
