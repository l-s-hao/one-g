"use client";
import { useSyncExternalStore, type ReactNode } from "react";
import { Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useLocale } from "@/i18n/LocaleProvider";
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler";
const subscribe = () => () => {};
export default function ThemeToggle({ targetTheme, children }: { targetTheme?: "light" | "dark"; children?: ReactNode }) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const { theme, setTheme } = useTheme();
  const { locale } = useLocale();
  const current = mounted && theme === "dark" ? "dark" : "light";
  const label = locale === "en" ? (current === "dark" ? "Switch to light mode" : "Switch to dark mode") : (current === "dark" ? "切换到日间模式" : "切换到夜间模式");
  // Keep the SSR and hydration snapshot inert and identical. Mount the real
  // button only after hydration instead of changing a native disabled attribute.
  if (targetTheme) return mounted ? <AnimatedThemeToggler data-theme-option={targetTheme} theme={current} targetTheme={targetTheme} onThemeChange={setTheme} duration={400} variant="circle" fromCenter={false} aria-pressed={current === targetTheme} aria-label={locale === "en" ? (targetTheme === "light" ? "Day" : "Night") : (targetTheme === "light" ? "日间" : "夜间")} >{children}</AnimatedThemeToggler> : <span aria-hidden="true">{children}</span>;
  if (!mounted) return <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36 }}><Moon /></span>;
  return <AnimatedThemeToggler data-theme-toggle theme={current} onThemeChange={setTheme} duration={400} variant="circle" fromCenter={false} title={label} aria-label={label} />;
}
