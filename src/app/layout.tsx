import type { Metadata } from "next";
import type { ReactNode } from "react";
import AuthProvider from "@/components/AuthProvider";
import ThemeProvider from "@/components/ThemeProvider";
import SiteShell from "@/components/SiteShell";
import { GlobalSmoothCursor } from "@/components/GlobalSmoothCursor";
import "./globals.css";
import "./themes.css";

export const metadata: Metadata = {
  title: "ONE - G / 万机智能机器人",
  description: "机器人产品展示、购买与在线定制平台",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" data-theme="dark">
      <body className="min-h-screen bg-black text-white antialiased">
        <GlobalSmoothCursor />
        <AuthProvider><ThemeProvider><SiteShell>{children}</SiteShell></ThemeProvider></AuthProvider>
      </body>
    </html>
  );
}
