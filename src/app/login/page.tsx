"use client";

import { LP } from "@/i18n/Elements";


import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import VerificationLogin from "@/components/VerificationLogin";

function LoginForm() {
  const params = useSearchParams();
  return <VerificationLogin switching={params.get("mode") === "switch"} />;
}
export default function LoginPage() {
  return <Suspense fallback={<LP role="status" className="p-8">正在加载登录表单…</LP>}><LoginForm /></Suspense>;
}
