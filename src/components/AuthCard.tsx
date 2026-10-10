"use client";

import { LDiv, LH1, LP, LSection } from "@/i18n/Elements";


import { LocalizedLink as Link } from "@/i18n/Elements";
import VerificationLogin from "./VerificationLogin";
import BrandLogo from "./BrandLogo";

// Compatibility for old entry URLs. Ordinary password authentication is retired.
export default function AuthCard({ mode, switching = false }: { mode: "login" | "register" | "forgot-password"; switching?: boolean }) {
  if (mode === "login") return <VerificationLogin switching={switching}/>;
  return <LDiv className="auth-page flex min-h-dvh items-center justify-center px-5 py-12"><LSection className="w-full max-w-[440px] rounded-3xl bg-[#0a0a0a] px-7 py-10 text-center">
    <BrandLogo variant="stacked" size="md"/>
    <LH1 className="mt-8 text-2xl font-semibold">使用验证码登录 ONE-G</LH1>
    <LP className="my-6 text-sm leading-6 text-neutral-400">普通用户改用手机号或邮箱验证码登录，无需密码。正式认证和首次登录建号服务尚未开放。</LP>
    <Link href="/login" className="underline">返回登录</Link>
  </LSection></LDiv>;
}
