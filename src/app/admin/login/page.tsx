"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginDestination, safeReturnTo } from "@/lib/auth-routing";

// Client redirect works with GitHub Pages static export; no second login form/API.
export default function AdminLoginPage() {
  const router = useRouter();
  useEffect(() => {
    const target = safeReturnTo(new URLSearchParams(window.location.search).get("returnTo"), "ADMIN");
    router.replace(loginDestination(target));
  }, [router]);
  return <p role="status" className="p-8">正在前往统一登录…</p>;
}
