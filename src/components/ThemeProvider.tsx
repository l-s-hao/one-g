"use client";
import { ThemeProvider as NextThemeProvider, useTheme } from "next-themes";
import { useEffect, type ReactNode } from "react";
import { normalizeStoredTheme, themeMigrationScript, themeStorageKey } from "@/lib/theme-preference";

/** next-themes 独占主题状态与持久化（含跨标签同步）；这里只纠正旧偏好，不另存一份状态。 */
function ValidThemePreference() {
  const { theme, setTheme } = useTheme();
  useEffect(() => {
    if (theme !== undefined && theme !== "light" && theme !== "dark") setTheme(normalizeStoredTheme(theme));
  }, [theme, setTheme]);
  return null;
}
export default function ThemeProvider({ children }: { children: ReactNode }) {
  // 迁移脚本先于 next-themes 读取本地偏好执行，首次应用 DOM 时即限定为 light/dark。
  return <><script dangerouslySetInnerHTML={{ __html: themeMigrationScript }} />
    <NextThemeProvider attribute="class" defaultTheme="light" enableSystem={false} themes={["light", "dark"]} storageKey={themeStorageKey} value={{ light: "light", dark: "dark" }} disableTransitionOnChange>
      <ValidThemePreference />{children}
    </NextThemeProvider></>;
}
