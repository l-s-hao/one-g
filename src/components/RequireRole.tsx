"use client";

import { LDiv, LH1, LP } from "@/i18n/Elements";


import { useEffect, useRef, type ReactNode } from "react";
import { LocalizedLink as Link } from "@/i18n/Elements";
import { usePathname, useRouter } from "next/navigation";
import { canAccessRole, loginDestination } from "@/lib/auth-routing";
import type { UserRole } from "@/types/auth";
import { useAuth } from "./AuthProvider";

export default function RequireRole({ role, children }: { role: UserRole; children: ReactNode }) {
  const { currentUser, authReady, exitTarget } = useAuth();
  const router = useRouter();
  const pathname = usePathname().replace(/\/+$/, "") || "/";
  const hadSession = useRef(false);
  useEffect(() => {
    if (!authReady) return;
    if (!currentUser) {
      // A USER session ending (including another tab) follows the logout route.
      const target = `${pathname}${window.location.search}${window.location.hash}`;
      router.replace(hadSession.current ? exitTarget ?? (role === "ADMIN" ? "/admin/login" : "/") : loginDestination(target, role));
    } else {
      hadSession.current = true;
      if (role === "USER" && currentUser.role === "ADMIN" && !canAccessRole(currentUser.role, role)) router.replace("/admin");
    }
  }, [currentUser, authReady, exitTarget, role, router, pathname]);
  if (!authReady || !currentUser) return <LP role="status" className="p-8">正在确认登录状态…</LP>;
  if (!canAccessRole(currentUser.role, role)) return <LDiv className="p-8"><LH1 className="text-xl">无权限</LH1><LP className="my-4">无管理员权限或当前入口不适用于此账户。</LP><Link intent="ordinary" href="/" >返回首页</Link></LDiv>;
  return children;
}
