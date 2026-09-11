"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import styles from "./SiteShell.module.css";

export default function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return <>{children}</>;
  const isWorkbench = pathname === "/customize";
  if (["/login", "/register", "/forgot-password"].includes(pathname)) {
    return <div className="min-h-dvh bg-black text-white"><Header /><main>{children}</main></div>;
  }
  return (
    <div className={`flex min-h-screen flex-col ${isWorkbench ? styles.workbenchShell : ""}`}>
      <Header />
      <main className="flex flex-1 items-start justify-center">{children}</main>
      {!isWorkbench && <Footer />}
    </div>
  );
}
