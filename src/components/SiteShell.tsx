"use client";

import { Fragment, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import RequireRole from "./RequireRole";
import { requiredRole } from "@/lib/auth-routing";
import Header from "./Header";
import Footer from "./Footer";
import ContactProvider from "./ContactProvider";

export default function SiteShell({ children }: { children: ReactNode }) {
  return <ContactProvider><SiteContent>{children}</SiteContent></ContactProvider>;
}

function SiteContent({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const pathname = usePathname().replace(/\/+$/, "") || "/";
  const role = requiredRole(pathname);
  const content = role ? <RequireRole role={role}><Fragment key={currentUser?.id ?? "anonymous"}>{children}</Fragment></RequireRole> : children;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return <>{content}</>;
  if (["/login", "/register", "/forgot-password"].includes(pathname)) {
    return <div className="min-h-dvh bg-black text-white"><Header /><main>{content}</main></div>;
  }
  const shell = (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-start justify-center">{content}</main>
      <Footer />
    </div>
  );
  return shell;
}
