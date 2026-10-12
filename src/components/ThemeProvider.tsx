"use client";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import type { ReactNode } from "react";
export default function ThemeProvider({ children }: { children: ReactNode }) {
  return <NextThemeProvider attribute="class" defaultTheme="light" enableSystem={false} themes={["light", "dark"]} storageKey="one-g-appearance-v1" disableTransitionOnChange>{children}</NextThemeProvider>;
}
