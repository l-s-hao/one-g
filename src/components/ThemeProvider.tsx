"use client";
import { ThemeProvider as NextThemeProvider, useTheme } from "next-themes";
import { useEffect, type ReactNode } from "react";
import { normalizeStoredTheme, themeMigrationScript, themeStorageKey } from "@/lib/theme-preference";

/** next-themes remains the sole state/persistence owner, including cross-tab updates. */
function ValidThemePreference() {
  const { theme, setTheme } = useTheme();
  useEffect(() => {
    if (theme !== undefined && theme !== "light" && theme !== "dark") setTheme(normalizeStoredTheme(theme));
  }, [theme, setTheme]);
  return null;
}
export default function ThemeProvider({ children }: { children: ReactNode }) {
  return <><script dangerouslySetInnerHTML={{ __html: themeMigrationScript }} />
    <NextThemeProvider attribute="class" defaultTheme="light" enableSystem={false} themes={["light", "dark"]} storageKey={themeStorageKey} value={{ light: "light", dark: "dark" }} disableTransitionOnChange>
      <ValidThemePreference />{children}
    </NextThemeProvider></>;
}
