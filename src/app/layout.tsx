import type { Metadata } from "next";
import type { ReactNode } from "react";
import SiteShell from "@/components/SiteShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "ONE - G / 万机智能机器人",
  description: "机器人产品展示、购买与在线定制平台",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-black text-white antialiased">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
