"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AuthCard from "@/components/AuthCard";

function LoginForm() {
  const params = useSearchParams();
  return <AuthCard mode="login" switching={params.get("mode") === "switch"} />;
}
export default function LoginPage() {
  return <Suspense fallback={<p role="status" className="p-8">正在加载登录表单…</p>}><LoginForm /></Suspense>;
}
