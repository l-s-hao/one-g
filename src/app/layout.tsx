import type { Metadata } from "next";
import type { ReactNode } from "react";
import AuthProvider from "@/components/AuthProvider";
import SiteShell from "@/components/SiteShell";
import "./globals.css";
import "./colors.css";

export const metadata: Metadata = {
  title: "ONE-G — 机器人系统与遥操作能力",
  description: "围绕 RobotDock，探索机器人硬件集成、SONIC Link 遥操作与面向任务的系统能力。",
  icons: {
    icon: [
      { url: "/one-g/brand/one-g-symbol-icon.png", type: "image/png", sizes: "192x192" },
      { url: "/one-g/brand/one-g-symbol.svg", type: "image/svg+xml", sizes: "any" },
    ],
    apple: "/one-g/brand/one-g-symbol-icon.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-black text-white antialiased">
        <AuthProvider><SiteShell>{children}</SiteShell></AuthProvider>
      </body>
    </html>
  );
}
