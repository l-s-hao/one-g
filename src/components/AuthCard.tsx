"use client";

import { ShimmerButton } from "@/components/ui/shimmer-button";


import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuth } from "./AuthProvider";
import { useLoginForm } from "./useLoginForm";
import InlineAuthError from "./InlineAuthError";
import ShineBorder from "./ShineBorder";
import BrandLogo from "./BrandLogo";

type Mode = "login" | "register" | "forgot-password";
const copy = {
  login: { title: "欢迎登录 ONE-G", description: "登录 ONE-G，探索智能的更多可能。", button: "登录 ONE-G" },
  register: { title: "创建账户", description: "加入 ONE-G，开启你的智能旅程。", button: "创建账户" },
  "forgot-password": { title: "忘记密码", description: "输入注册邮箱，找回你的账户。", button: "发送重置链接" },
};

export default function AuthCard({ mode, switching = false }: { mode: Mode; switching?: boolean }) {
  const loginForm = useLoginForm("USER");
  const { currentUser } = useAuth();
  const pending = loginForm.pending;
  const [message, setMessage] = useState("");
  const content = copy[mode];
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    if (mode === "register" && data.get("password") !== data.get("confirmPassword")) {
      setMessage("两次输入的密码不一致，请重新输入。");
      return;
    }
    setMessage("账户服务暂未开放，请稍后再试。");
  }

  return (
    <div className="auth-page flex min-h-dvh items-center justify-center px-5 py-12">
      <section aria-labelledby="auth-title" className="relative w-full max-w-[440px] rounded-3xl bg-[#0a0a0a] px-7 py-10 sm:px-10 sm:py-12">
        <ShineBorder shineColor={["var(--effect-color)", "var(--effect-dim)", "var(--effect-color)"]} duration={10} borderWidth={1} />
        <div className="relative">
          {mode === "login" && (
            <Link href="/" className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-xs text-neutral-400 transition-colors hover:border-white/40 hover:text-white">
              <ArrowLeft size={14} aria-hidden="true" />返回首页
            </Link>
          )}
          <div className="mb-10 text-center">
            <Link href="/" aria-label="ONE-G 万机智能 首页" className="inline-block"><BrandLogo variant={mode === "forgot-password" ? "horizontal" : "stacked"} size={mode === "forgot-password" ? "sm" : "md"} /></Link>
            <p className="mt-2 text-[9px] tracking-[0.35em] text-neutral-500">INTELLIGENCE IN MOTION</p>
          </div>
          <h1 id="auth-title" className="text-center text-2xl font-semibold tracking-tight">{switching ? "切换账号" : content.title}</h1>
          <p className="mt-3 text-center text-sm leading-6 text-neutral-400">{content.description}</p>
          {mode === "login" && <div className="mt-4 text-center text-xs leading-5 text-neutral-400">
            <p>Frontend Authentication Prototype · 仅限演示账号，请勿输入真实密码。</p>
            <p>user@one-g.com / 123456</p>
            {currentUser?.role !== "USER" && <Link href="/admin/login" className="underline underline-offset-4">管理员入口</Link>}
          </div>}
          <form className="mt-8 space-y-5" noValidate={mode === "login"} onSubmit={mode === "login" ? loginForm.submit : submit} onChange={() => { setMessage(""); loginForm.clearErrors(); }}>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm text-neutral-200">邮箱</label>
              <input id="email" name="email" type="email" autoComplete="email" placeholder="name@example.com" required className="auth-input" aria-invalid={!!loginForm.fields.account || loginForm.invalidCredentials} aria-describedby="account-error login-error" disabled={pending} />
              {loginForm.fields.account && <InlineAuthError id="account-error" message={loginForm.fields.account} />}
            </div>
            {mode !== "forgot-password" && (
              <div>
                <label htmlFor="password" className="mb-2 block text-sm text-neutral-200">密码</label>
                <input id="password" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "register" ? 8 : undefined} placeholder={mode === "register" ? "设置密码（至少 8 位）" : "输入密码"} required className="auth-input" aria-invalid={!!loginForm.fields.password || loginForm.invalidCredentials} aria-describedby="password-error login-error" disabled={pending} />
                {loginForm.fields.password && <InlineAuthError id="password-error" message={loginForm.fields.password} />}
              </div>
            )}
            {mode === "register" && (
              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm text-neutral-200">确认密码</label>
                <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" placeholder="再次输入密码" required className="auth-input" />
              </div>
            )}
            {mode === "login" && <div className="text-right"><Link href="/forgot-password" className="text-xs text-neutral-400 hover:text-white">忘记密码？</Link></div>}
            <InlineAuthError id="login-error" message={mode === "login" ? loginForm.message : message} />
            <>{mode === "forgot-password" ? <button type="submit" className="h-12 w-full rounded-full bg-white text-sm font-semibold text-black transition-colors hover:bg-neutral-200">{content.button}</button> : <ShimmerButton type="submit" disabled={pending} className="h-12 w-full">{pending ? "正在登录…" : content.button}</ShimmerButton>}</>
          </form>
          <div className="mt-6 border-t border-white/10 pt-6 text-center text-sm text-neutral-500">
            {mode === "login" ? <>还没有账户？ <Link href="/register" className="text-white hover:underline">立即注册</Link></> : <Link href="/login" className="text-neutral-300 hover:text-white">{mode === "register" ? "已有账户？ 返回登录" : "返回登录"}</Link>}
          </div>
        </div>
      </section>
    </div>
  );
}
