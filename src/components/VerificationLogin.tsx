"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LocalizedLink as Link, LButton, LDiv, LForm, LH1, LLabel, LP, LSection, LSpan } from "@/i18n/Elements";
import { useLocale, translate } from "@/i18n/LocaleProvider";
import { Smartphone, MessageCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { safeReturnTo } from "@/lib/auth-routing";
import { mockAuthEnabled } from "@/lib/demo-mode";
import { testCode, testIdentities, type LoginChannel } from "@/lib/auth/verification";
import { normalizeAddress, validAddress, type ServiceRegion } from "@/lib/auth/policy";
import { useAuthVerification } from "./useAuthVerification";
import { RegionField, PasswordField, HumanField } from "./AuthFields";
import BrandLogo from "./BrandLogo";
import LoginInput from "./LoginInput";
import styles from "./VerificationLogin.module.css";

type LoginMode = LoginChannel | "wechat" | "admin";
export default function VerificationLogin({ switching = false, initialMode = "email", initialRegion = "mainland", returnTo = null, registered = false }: {
  switching?: boolean; initialMode?: "email" | "admin"; initialRegion?: ServiceRegion; returnTo?: string | null; registered?: boolean;
}) {
  const router = useRouter(); const { locale } = useLocale();
  const { login, loginPassword, verifyCode, currentUser, authReady } = useAuth();
  const [mode, setMode] = useState<LoginMode>(initialMode);
  const [region, setRegion] = useState<ServiceRegion>(initialRegion);
  const [method, setMethod] = useState<"password" | "code">("code");
  const [recipient, setRecipient] = useState(""); const [password, setPassword] = useState("");
  const [adminAccount, setAdminAccount] = useState("");
  const [destination, setDestination] = useState<{ userId: string; href: string } | null>(null);
  const addresses = useRef({ email: "", phone: "" });
  const channel: LoginChannel = mode === "phone" ? "phone" : "email";
  const verification = useAuthVerification({ purpose: "login", region, channel, recipient });
  const completed = !!destination;
  useEffect(() => {
    if (authReady && destination && currentUser?.id === destination.userId) router.replace(destination.href);
  }, [authReady, currentUser, destination, router]);
  const clear = () => { verification.clear(); setPassword(""); setDestination(null); };
  const changeMode = (next: LoginMode) => {
    if (mode === next) return; clear(); setMode(next);
    setRecipient(next === "email" || next === "phone" ? addresses.current[next] : "");
  };
  const changeRegion = (next: ServiceRegion) => {
    if (next === region) return; clear(); setRegion(next);
    if (next === "international") {
      addresses.current.phone = "";
      if (mode === "phone" || mode === "wechat") { setMode("email"); setRecipient(addresses.current.email); }
    }
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (completed || !authReady || !mockAuthEnabled) return;
    if (mode !== "admin" && !validAddress(channel, normalizeAddress(channel, recipient))) { verification.error(channel === "phone" ? "请输入有效的 11 位手机号。" : "请输入有效的邮箱地址。"); return; }
    if ((mode === "admin" && (!adminAccount.trim() || !password)) || (mode !== "admin" && method === "password" && !password)) { verification.error(mode === "admin" ? "请输入管理员账号和密码。" : "请输入密码。"); return; }
    if (mode !== "admin" && method === "code" && !verification.checkCode()) return;
    await verification.run("submit", async signal => {
      const result = mode === "admin" ? await login(adminAccount, password, "ADMIN", signal)
        : method === "password" ? await loginPassword({ region, channel, recipient, password }, signal)
        : await verifyCode({ region, channel, recipient, purpose: "login", challengeId: verification.challenge!.id, code: verification.code }, signal);
      if (signal.aborted) return;
      if (!result.ok || (mode === "admin" ? result.user.role !== "ADMIN" : result.user.role !== "USER")) { verification.error("无法完成验证，请检查资料或稍后重试。"); return; }
      setPassword(""); setDestination({ userId: result.user.id, href: safeReturnTo(returnTo, result.user.role) });
    });
  };
  const registrationParams = new URLSearchParams({ region, returnTo: safeReturnTo(returnTo, "USER") });
  const busy = !!verification.pending || completed;
  return <LDiv className={styles.page}><LSection aria-labelledby="auth-title" className={styles.card} data-login-mode={mode}>
    <Link href="/" className={styles.brand} aria-label="返回首页"><BrandLogo variant="horizontal" size="sm" /></Link>
    <LH1 id="auth-title" className={styles.title}>登录 ONE-G</LH1><LP className={styles.slogan}>一智通万机</LP>
    {registered && <LP role="status" className={styles.feedback}>注册成功，请登录。</LP>}
    {switching && <LP className={styles.feedback}>切换用户</LP>}
    {mode !== "admin" && <RegionField value={region} onChange={changeRegion} />}
    {mode !== "email" && <LButton type="button" className={styles.back} onClick={() => changeMode("email")}>← 返回邮箱登录</LButton>}
    {mode === "wechat" ? <LDiv className={styles.wechat}>
      <LDiv className={styles.placeholder} aria-hidden="true"><MessageCircle size={32} /></LDiv>
      <LP role="status" className={styles.feedback}>微信登录暂未接入，请先使用邮箱或手机号登录。</LP>
    </LDiv> : <>
      {mode !== "admin" && <LDiv className={styles.authMethods} role="group" aria-label="验证方式">
        {([['password', '密码登录'], ['code', '验证码登录']] as const).map(([value, label]) => <LButton key={value} type="button" className={styles.secondary} aria-pressed={method === value} onClick={() => { if (value !== method) { clear(); setMethod(value); } }}>{label}</LButton>)}
      </LDiv>}
      <LForm noValidate className={styles.form} onSubmit={submit} aria-busy={!!verification.pending}>
        <LDiv className={styles.field}><LLabel htmlFor="recipient">{mode === "admin" ? "管理员账号" : channel === "phone" ? "手机号" : "邮箱"}</LLabel>
          <LoginInput id="recipient" disabled={!authReady || completed} type={mode === "admin" ? "text" : channel === "phone" ? "tel" : "email"} inputMode={channel === "phone" ? "tel" : "email"} autoComplete={mode === "admin" ? "username" : channel === "phone" ? "tel" : "email"} value={mode === "admin" ? adminAccount : recipient} aria-invalid={!!verification.message} aria-describedby="auth-feedback" onChange={event => { clear(); if (mode === "admin") setAdminAccount(event.target.value); else { setRecipient(event.target.value); addresses.current[channel] = event.target.value; } }} />
        </LDiv>
        {mode === "admin" || method === "password" ? <PasswordField id="login-password" autoComplete="current-password" value={password} disabled={busy || !authReady} onChange={event => setPassword(event.target.value)} aria-invalid={!!verification.message} aria-describedby="auth-feedback" /> : <>
          <HumanField ready={verification.humanReady} pending={verification.pending === "human"} disabled={busy || !authReady} onVerify={verification.requestHuman} />
          <LDiv className={styles.field}><LLabel htmlFor="verification-code">验证码</LLabel><LDiv className={styles.codeRow}>
            <LoginInput id="verification-code" type="text" inputMode="numeric" autoComplete="one-time-code" value={verification.code} maxLength={6} disabled={busy || !authReady} onChange={event => verification.setCode(event.target.value)} aria-invalid={!!verification.message} aria-describedby="auth-feedback" />
            <LButton type="button" className={styles.secondary} disabled={!verification.humanReady || busy || !authReady || verification.seconds > 0} onClick={verification.send}>{verification.pending === "send" ? "发送中…" : verification.seconds > 0 ? `${verification.seconds} 秒后重发` : "获取验证码"}</LButton>
          </LDiv></LDiv>
        </>}
        {mode === "phone" && <LP className={styles.feedback}>仅限已有已验证绑定的手机号。手机绑定验证尚未接入，新注册手机号不能用于登录。</LP>}
        <LP id="auth-feedback" role="alert" tabIndex={-1} className={`${styles.feedback} ${styles.error}`} hidden={!verification.message}>{verification.message}</LP>
        <LP role="status" className={styles.feedback} hidden={!verification.notice}>{verification.notice}</LP>
        <LButton effect="invert" effectSurface="card" intent="ordinary" type="submit" className={styles.submit} disabled={!mockAuthEnabled || !authReady || busy}>{verification.pending === "submit" ? "验证中…" : mockAuthEnabled ? "登录 ONE-G（演示）" : "登录暂未开放"}</LButton>
      </LForm>
    </>}
    <LDiv className={styles.divider}>其他登录方式</LDiv><LDiv className={styles.methods} role="group" aria-label="其他登录方式">
      {([{ value: "phone", label: "手机号登录", icon: Smartphone }, { value: "wechat", label: "微信扫码登录", icon: MessageCircle }, { value: "admin", label: "管理员号登录", icon: ShieldCheck }] as const).filter(item => region === "mainland" || item.value === "admin").map(({ value, label, icon: Icon }) => <LButton key={value} type="button" className={styles.secondary} aria-pressed={mode === value} onClick={() => changeMode(value)}><Icon size={16} aria-hidden="true" /><LSpan>{label}</LSpan></LButton>)}
    </LDiv>
    {mode !== "admin" && <Link href={`/register?${registrationParams}`} className={styles.accountLink}>没有账号？注册账号</Link>}
    <LDiv className={styles.demo}><LP>{mockAuthEnabled ? "本地演示：没有真实邮件或人机服务；新注册的虚构账号仅在本次页面运行期间有效，刷新后失效。" : "认证服务尚未接入，暂不支持真实用户登录。"}</LP>
      {mockAuthEnabled && mode !== "admin" && <details><summary>{translate("本地测试说明", locale)}</summary><LP>测试身份：{testIdentities.map(item => item[channel]).join(" / ")}</LP><LP>测试验证码：{testCode}（5 分钟有效，60 秒重发）</LP><LP>没有账号请先显式注册；验证码登录不会创建账号。</LP></details>}
    </LDiv>
  </LSection></LDiv>;
}
