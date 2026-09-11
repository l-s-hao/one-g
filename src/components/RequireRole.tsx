"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { canAccessRole, loginDestination } from "@/lib/auth-routing";
import type { UserRole } from "@/types/auth";
import { useAuth } from "./AuthProvider";

export default function RequireRole({ role, children }: { role: UserRole; children: ReactNode }) {
  const { currentUser, authReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hadSession = useRef(false);
  useEffect(() => {
    if (!authReady) return;
    if (!currentUser) {
      // A USER session ending (including another tab) follows the logout route.
      const target = `${pathname}${window.location.search}${window.location.hash}`;
      router.replace(hadSession.current ? (role === "ADMIN" ? "/admin/login" : "/") : loginDestination(target, role));
    } else {
      hadSession.current = true;
      if (role === "USER" && currentUser.role === "ADMIN" && !canAccessRole(currentUser.role, role, pathname)) router.replace("/admin");
    }
  }, [currentUser, authReady, role, router, pathname]);
  if (!authReady || !currentUser) return <p role="status" className="p-8">正在确认登录状态…</p>;
  if (!canAccessRole(currentUser.role, role, pathname)) return <div className="p-8"><h1 className="text-xl">无权限</h1><p className="my-4">无管理员权限或当前入口不适用于此账户。</p><Link href="/" className="underline">返回首页</Link></div>;
  return children;
}
