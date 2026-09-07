import type { Metadata } from "next";
import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "ONE - G / 万机智能机器人",
  description: "机器人产品展示、购买与在线定制平台",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-black text-white antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex flex-1 items-start justify-center">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
