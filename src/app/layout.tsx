import type { Metadata } from "next";
import type { ReactNode } from "react";
import LocaleProvider from "@/i18n/LocaleProvider";
import AuthProvider from "@/components/AuthProvider";
import ThemeProvider from "@/components/ThemeProvider";
import SiteShell from "@/components/SiteShell";
import "./globals.css";
import "./colors.css";
import "@/components/card-hover.css";
import "@/components/button-effects.css";

export const metadata: Metadata = {
  title: "ONE-G — 机器人系统与遥操作能力",
  description: "围绕 RoboDock，探索机器人硬件集成、SONIC Link 遥操作与面向任务的系统能力。",
  icons: {
    apple: "/one-g/brand/one-g-symbol-icon.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* Keep the existing icons in the initial head, including streamed/new-tab navigation. */}
        <link rel="icon" href="/one-g/brand/one-g-symbol-icon.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/one-g/brand/one-g-symbol.svg" type="image/svg+xml" sizes="any" />
      </head>
      <body className="min-h-screen bg-black text-white antialiased">
        <ThemeProvider><LocaleProvider><AuthProvider><SiteShell>{children}</SiteShell></AuthProvider></LocaleProvider></ThemeProvider>
      </body>
    </html>
  );
}
