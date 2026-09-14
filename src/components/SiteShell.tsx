"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import RequireRole from "./RequireRole";
import { requiredRole } from "@/lib/auth-routing";
import BrandThemeBoundary from "./BrandThemeBoundary";
import { useTheme } from "./ThemeProvider";
import Header from "./Header";
import Footer from "./Footer";
import styles from "./SiteShell.module.css";

export default function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isBrandRoute } = useTheme();
  const role = requiredRole(pathname);
  const content = role ? <RequireRole role={role}>{children}</RequireRole> : children;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return <>{content}</>;
  const isWorkbench = pathname === "/customize";
  if (["/login", "/register", "/forgot-password"].includes(pathname)) {
    return <div className="min-h-dvh bg-black text-white"><Header /><main>{content}</main></div>;
  }
  const shell = (
    <div className={`flex min-h-screen flex-col ${isWorkbench ? styles.workbenchShell : ""}`}>
      <Header />
      <main className="flex flex-1 items-start justify-center">{content}</main>
      {!isWorkbench && <Footer />}
    </div>
  );
  return isBrandRoute ? <BrandThemeBoundary>{shell}</BrandThemeBoundary> : shell;
}
