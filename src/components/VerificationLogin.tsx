"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { safeReturnTo } from "@/lib/auth-routing";
import { canUseMockShortcut, mockShortcutEnabled } from "@/lib/auth/mock-login";
import { mockAuthEnabled } from "@/lib/demo-mode";
import { verificationService, normalizeRecipient, validRecipient, VerificationError, testIdentities, testCode, type Challenge, type LoginChannel } from "@/lib/auth/verification";
import BrandLogo from "./BrandLogo";
import ShineBorder from "./ShineBorder";

export default function VerificationLogin({ switching = false }: { switching?: boolean }) {
  const router = useRouter();
  const { verifyCode, loginTestAccount, currentUser, authReady } = useAuth();
  const [destination, setDestination] = useState<{ userId: string; href: string } | null>(null);
  const [channel, setChannel] = useState<LoginChannel>("phone");
  const [recipient, setRecipient] = useState("");
  const [code, setCode] = useState("");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState<"send" | "verify" | null>(null);
  const [retryAt, setRetryAt] = useState(0);
  const [now, setNow] = useState(0);
  const request = useRef<AbortController | null>(null);
  const currentChallenge = useRef<string | null>(null);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => { clearInterval(timer); request.current?.abort(); if (currentChallenge.current) verificationService.discard(currentChallenge.current); };
  }, []);
  useEffect(() => {
    // Navigate only once the single AuthProvider has committed the authenticated user.
    if (authReady && destination && currentUser?.id === destination.userId) router.replace(destination.href);
  }, [authReady, currentUser, destination, router]);
  const shortcut = !challenge && !code && canUseMockShortcut(channel, recipient);
  const clear = () => {
    setDestination(null);
    request.current?.abort(); request.current = null;
    if (currentChallenge.current) verificationService.discard(currentChallenge.current);
    currentChallenge.current = null;
    setChallenge(null); setCode(""); setMessage(""); setNotice(""); setPending(null); setRetryAt(0);
  };
  const begin = (kind: "send" | "verify") => {
    if (request.current || !mockAuthEnabled || !authReady) return null;
    const controller = new AbortController(); request.current = controller;
    setPending(kind); setMessage(""); setNotice(""); return controller;
  };
  const finish = (controller: AbortController) => { if (request.current === controller) { request.current = null; setPending(null); } };
  const fail = (error: unknown, controller: AbortController) => {
    if (controller.signal.aborted) return;
    setMessage(error instanceof VerificationError ? error.message : "暂时无法完成请求，请稍后重试。");
    if (error instanceof VerificationError && error.retryAt) { setRetryAt(error.retryAt); setNow(Date.now()); }
  };
  const send = async () => {
    const address = normalizeRecipient(channel, recipient);
    if (!validRecipient(channel, address)) { setMessage(channel === "phone" ? "请输入有效的 11 位手机号。" : "请输入有效的邮箱地址。"); return; }
    if (retryAt > Date.now()) return;
    const controller = begin("send"); if (!controller) return;
    setCode(""); setChallenge(null);
    if (currentChallenge.current) verificationService.discard(currentChallenge.current);
    currentChallenge.current = null;
    try {
      const result = await verificationService.send({ channel, recipient: address }, controller.signal);
      if (controller.signal.aborted) { verificationService.discard(result.id); return; }
      currentChallenge.current = result.id; setChallenge(result); setRetryAt(result.resendAt); setNow(Date.now());
      setNotice("演示验证请求已就绪，未发送真实短信/邮件。");
    } catch (error) { fail(error, controller); } finally { finish(controller); }
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!shortcut && (!challenge || challenge.expiresAt <= Date.now())) { setMessage("验证码错误或已失效，请重新获取。"); return; }
    if (!shortcut && challenge && !new RegExp(`^\\d{${challenge.codeLength}}$`).test(code)) { setMessage(`请输入 ${challenge.codeLength} 位数字验证码。`); return; }
    const controller = begin("verify"); if (!controller) return;
    try {
      const result = shortcut
        ? await loginTestAccount(channel, recipient, controller.signal)
        : await verifyCode({ channel, recipient: normalizeRecipient(channel, recipient), challengeId: challenge!.id, code }, controller.signal);
      if (controller.signal.aborted) return;
      if (!result.ok) { setMessage("登录状态已更新，请重试。"); finish(controller); return; }
      setDestination({ userId: result.user.id, href: safeReturnTo(new URLSearchParams(window.location.search).get("returnTo"), result.user.role) });
      // Keep the lock until navigation unmounts the form. Never auto-add to cart.
    } catch (error) { fail(error, controller); finish(controller); }
  };
  const seconds = Math.max(0, Math.ceil((retryAt - now) / 1000));
  return <div className="auth-page flex min-h-dvh items-center justify-center px-5 py-12">
    <section aria-labelledby="auth-title" className="relative w-full max-w-[440px] rounded-3xl bg-[#0a0a0a] px-7 py-10 sm:px-10">
      <ShineBorder shineColor={["var(--effect-color)", "var(--effect-dim)"]} duration={10} borderWidth={1}/>
      <div className="relative">
        <Link href="/" className="text-sm">← 返回首页</Link>
        <div className="my-8 text-center"><BrandLogo variant="stacked" size="md"/></div>
        <h1 id="auth-title" className="text-center text-2xl font-semibold">{switching ? "切换用户" : "欢迎登录 ONE-G"}</h1>
        <div className="my-6 flex gap-2" role="group" aria-label="登录方式">
          {([['phone', '手机号登录'], ['email', '邮箱登录']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={channel === value} onClick={() => { if (channel !== value) { clear(); setChannel(value); setRecipient(""); } }} className="flex-1 rounded-full border border-current px-3 py-2 text-sm" style={{ opacity: channel === value ? 1 : .55 }}>{label}</button>)}
        </div>
        <p className="text-sm leading-6 text-neutral-400">{mockAuthEnabled ? "演示模式，未发送真实短信/邮件。仅限以下虚构测试身份。" : "验证码服务尚未接入，暂不支持真实用户登录。"}</p>
        {mockAuthEnabled && <div className="mt-3 text-xs leading-6"><p>测试身份：{testIdentities.map(item => item[channel]).join(" / ")}</p><p>测试验证码：{testCode}（5 分钟有效，60 秒重发）</p><p>{mockShortcutEnabled ? "可输入测试账号直接点击登录；如需测试验证码，请先获取验证码。" : "仅使用预置演示账号，不创建真实账号。"}</p></div>}
        <form onSubmit={submit} noValidate className="mt-6 space-y-5">
          <div><label htmlFor="recipient" className="mb-2 block text-sm">{channel === "phone" ? "手机号" : "邮箱"}</label>
            <input id="recipient" className="auth-input" type={channel === "phone" ? "tel" : "email"} autoComplete={channel === "phone" ? "tel" : "email"} value={recipient} onChange={event => { clear(); setRecipient(event.target.value); }} aria-describedby="verification-message"/>
          </div>
          <div><label htmlFor="verification-code" className="mb-2 block text-sm">验证码</label>
            <div className="flex gap-2"><input id="verification-code" className="auth-input min-w-0" type="text" inputMode="numeric" autoComplete="one-time-code" value={code} maxLength={challenge?.codeLength ?? 6} onChange={event => setCode(event.target.value)} disabled={pending === "verify"} aria-describedby="verification-message"/>
              <button type="button" className="shrink-0 rounded-xl border border-current px-3 text-sm" disabled={!mockAuthEnabled || !!pending || seconds > 0} onClick={send}>{pending === "send" ? "发送中…" : seconds > 0 ? `${seconds} 秒后重发` : "获取验证码"}</button></div>
          </div>
          <p id="verification-message" role="alert" className="text-sm">{message}</p><p role="status" className="text-sm">{notice}</p>
          <button type="submit" className="h-12 w-full rounded-full bg-white text-sm font-semibold text-black disabled:opacity-50" disabled={!mockAuthEnabled || !authReady || !!pending || (!challenge && !shortcut)}>{pending === "verify" ? "验证中…" : mockAuthEnabled ? "登录 ONE-G（演示）" : "登录暂未开放"}</button>
        </form>
      </div>
    </section>
  </div>;
}
