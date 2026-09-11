"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import styles from "./SiteShell.module.css";

export default function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isWorkbench = pathname === "/customize";
  if (["/login", "/register", "/forgot-password"].includes(pathname)) {
    return <main className="min-h-dvh bg-black text-white">{children}</main>;
  }
  return (
    <div className={`flex min-h-screen flex-col ${isWorkbench ? styles.workbenchShell : ""}`}>
      <Header />
      <main className="flex flex-1 items-start justify-center">{children}</main>
      {!isWorkbench && <Footer />}
    </div>
  );
}
