import { Suspense } from "react";
import { LP } from "@/i18n/Elements";
import LoginEntry from "@/components/LoginEntry";

export default function LoginPage() {
  return <Suspense fallback={<LP role="status" className="p-8">正在加载登录表单…</LP>}><LoginEntry /></Suspense>;
}
