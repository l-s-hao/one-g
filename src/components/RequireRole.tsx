"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/types/auth";
import { useAuth } from "./AuthProvider";

export default function RequireRole({ role, children }: { role: UserRole; children: ReactNode }) {
  const { currentUser, ready } = useAuth();
  const router = useRouter();
  const hadSession = useRef(false);
  useEffect(() => {
    if (!ready) return;
    if (!currentUser) {
      // A USER session ending (including another tab) follows the logout route.
      router.replace(role === "ADMIN" ? "/admin/login" : hadSession.current ? "/" : "/login");
    } else {
      hadSession.current = true;
      if (role === "USER" && currentUser.role === "ADMIN") router.replace("/admin");
    }
  }, [currentUser, ready, role, router]);
  if (!ready || !currentUser) return <p role="status" className="p-8">正在确认登录状态…</p>;
  if (currentUser.role !== role) return <div className="p-8"><h1 className="text-xl">无权限</h1><p className="my-4">无管理员权限或当前入口不适用于此账户。</p><Link href="/" className="underline">返回首页</Link></div>;
  return children;
}
