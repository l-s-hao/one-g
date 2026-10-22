"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LocalizedLink as Link, LButton, LDialog, LDiv, LForm, LH1, LH2, LLabel, LP, LSection } from "@/i18n/Elements";
import { useLocale, translate } from "@/i18n/LocaleProvider";
import { registrationErrors, type RegistrationProfile } from "@/lib/auth/accounts";
import { accountService } from "@/lib/auth/account-service";
import { mockAuthEnabled } from "@/lib/demo-mode";
import { safeReturnTo } from "@/lib/auth-routing";
import { type ServiceRegion } from "@/lib/auth/policy";
import BrandLogo from "./BrandLogo";
import LoginInput from "./LoginInput";
import { RegionField, HumanField, PasswordField } from "./AuthFields";
import { useAuthVerification } from "./useAuthVerification";
import { useRegistrationLeaveGuard } from "./useRegistrationLeaveGuard";
import styles from "./VerificationLogin.module.css";

export default function RegistrationForm() {
  const params = useSearchParams(); const router = useRouter(); const { locale } = useLocale();
  const initialRegion: ServiceRegion = params.get("region") === "international" ? "international" : "mainland";
  const empty = (): RegistrationProfile => ({ region: initialRegion, nickname: "", password: "", phone: "", email: "", affiliation: "individual", organization: "" });
  const [profile, setProfile] = useState<RegistrationProfile>(empty);
  const [errors, setErrors] = useState<ReturnType<typeof registrationErrors>>({});
  const verification = useAuthVerification({ purpose: "register", region: profile.region, channel: "email", recipient: profile.email });
  const requestId = useRef<string | null>(null);
  const leaving = useRef(false);
  const dirty = !!(profile.nickname || profile.password || profile.email || profile.phone || profile.organization || verification.code || profile.affiliation !== "individual" || profile.region !== initialRegion);
  const reset = () => { verification.clear(); setProfile(empty()); setErrors({}); requestId.current = null; };
  const guard = useRegistrationLeaveGuard(dirty, reset);
  const lifecycleReset = useRef(reset);
  useEffect(() => { lifecycleReset.current = reset; });
  useEffect(() => {
    const hide = () => lifecycleReset.current();
    const show = (event: PageTransitionEvent) => { if (event.persisted) lifecycleReset.current(); };
    window.addEventListener("pagehide", hide); window.addEventListener("pageshow", show);
    return () => { window.removeEventListener("pagehide", hide); window.removeEventListener("pageshow", show); };
  }, []);
  const dialog = useRef<HTMLDialogElement>(null); const continueButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (guard.open) { dialog.current?.showModal(); continueButton.current?.focus(); }
    else dialog.current?.close();
  }, [guard.open]);
  const loginHref = (success = false) => `/login?${new URLSearchParams({ returnTo: safeReturnTo(params.get("returnTo"), "USER"), region: profile.region, ...(success ? { registered: "1" } : {}) })}`;
  const update = <K extends keyof RegistrationProfile>(field: K, value: RegistrationProfile[K]) => {
    if (leaving.current) return;
    if (field === "email" || field === "region") { verification.clear(); requestId.current = null; }
    setErrors(previous => ({ ...previous, [field]: undefined }));
    setProfile(previous => ({ ...previous, [field]: value,
      ...(field === "region" && value === "international" ? { phone: "" } : {}),
      ...(field === "affiliation" && value === "individual" ? { organization: "" } : {}),
    }));
  };
  const validate = () => {
    const found = registrationErrors(profile); setErrors(found);
    const first = Object.keys(found)[0];
    if (first) { document.getElementById(first === "region" ? "service-region" : `register-${first}`)?.focus(); return false; }
    return true;
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (leaving.current || !mockAuthEnabled || !validate() || !verification.checkCode()) return;
    await verification.run("submit", async signal => {
      requestId.current ??= crypto.randomUUID();
      await accountService.register({ profile, verification: { purpose: "register", region: profile.region, channel: "email", recipient: profile.email, challengeId: verification.challenge!.id, code: verification.code }, requestId: requestId.current }, signal);
      if (signal.aborted) return;
      leaving.current = true;
      const href = loginHref(true);
      guard.allow(() => router.replace(href));
    });
  };
  return <LDiv className={`${styles.page} ${styles.registration}`}><LSection className={styles.card} aria-labelledby="register-title">
    <Link href="/" className={styles.brand} aria-label="返回首页"><BrandLogo variant="horizontal" size="sm" /></Link>
    <LH1 id="register-title" className={styles.title}>注册 ONE-G 账号</LH1><LP className={styles.slogan}>一智通万机</LP>
    <LForm className={styles.form} noValidate onSubmit={submit} aria-busy={!!verification.pending}>
      <RegionField disabled={verification.pending === "submit"} value={profile.region} onChange={region => update("region", region)} />
      <ProfileInput field="nickname" label="昵称" type="text" autoComplete="nickname" value={profile.nickname} error={errors.nickname} disabled={verification.pending === "submit"} onValueChange={value => update("nickname", value)} />
      <PasswordField id="register-password" required autoComplete="new-password" value={profile.password} disabled={verification.pending === "submit"} onChange={event => update("password", event.target.value)} aria-invalid={!!errors.password} aria-describedby="password-help register-password-error" />
      <LP id="password-help" className={styles.feedback}>密码需为 12–128 字符，并包含字母和非字母字符。</LP>
      <LP id="register-password-error" className={`${styles.feedback} ${styles.error}`} hidden={!errors.password}>{errors.password}</LP>
      <ProfileInput field="email" label="邮箱" type="email" autoComplete="email" value={profile.email} error={errors.email} disabled={verification.pending === "submit"} onValueChange={value => update("email", value)} />
      {profile.region === "mainland" && <><ProfileInput field="phone" label="手机号（中国大陆 +86）" type="tel" autoComplete="tel-national" value={profile.phone} error={errors.phone} disabled={verification.pending === "submit"} onValueChange={value => update("phone", value)} /><LP className={styles.feedback}>手机绑定验证尚未接入；此手机号仅为待确认资料，不用于登录或找回密码。</LP></>}
      <LDiv className={styles.field}><LLabel htmlFor="register-affiliation">所属类型</LLabel>
        <select className={styles.select} id="register-affiliation" value={profile.affiliation} disabled={verification.pending === "submit"} onChange={event => update("affiliation", event.target.value as RegistrationProfile["affiliation"])}>
          <option value="individual">{translate("个人", locale)}</option><option value="organization">{translate("公司或组织", locale)}</option>
        </select>
      </LDiv>
      {profile.affiliation === "organization" && <ProfileInput field="organization" label="公司／组织名称" type="text" autoComplete="organization" value={profile.organization} error={errors.organization} disabled={verification.pending === "submit"} onValueChange={value => update("organization", value)} />}
      <details className={styles.optional}><summary>{translate("实名信息 / 实名绑定（选填）", locale)}</summary><LP>实名绑定暂未开通，请勿提交真实证件信息。不填写不影响普通注册。</LP></details>
      <HumanField ready={verification.humanReady} pending={verification.pending === "human"} disabled={!!verification.pending} onVerify={() => { if (validate()) void verification.requestHuman(); }} />
      <LDiv className={styles.field}><LLabel htmlFor="registration-code">邮箱验证码</LLabel><LDiv className={styles.codeRow}>
        <LoginInput id="registration-code" type="text" inputMode="numeric" autoComplete="one-time-code" value={verification.code} maxLength={6} disabled={verification.pending === "submit"} onChange={event => verification.setCode(event.target.value)} aria-describedby="auth-feedback" aria-invalid={!!verification.message} />
        <LButton type="button" className={styles.secondary} disabled={!verification.humanReady || !!verification.pending || verification.seconds > 0} onClick={() => { if (validate()) void verification.send(); }}>{verification.pending === "send" ? "发送中…" : verification.seconds > 0 ? `${verification.seconds} 秒后重发` : "获取验证码"}</LButton>
      </LDiv></LDiv>
      <LP id="auth-feedback" role="alert" tabIndex={-1} className={`${styles.feedback} ${styles.error}`} hidden={!verification.message}>{verification.message}</LP>
      <LP role="status" className={styles.feedback} hidden={!verification.notice}>{verification.notice}</LP>
      <LButton type="submit" effect="invert" effectSurface="card" intent="ordinary" className={styles.submit} disabled={!mockAuthEnabled || !!verification.pending}>{verification.pending === "submit" ? "注册中…" : mockAuthEnabled ? "注册账号（本地演示）" : "注册服务暂未开放"}</LButton>
      <LButton type="button" className={styles.secondary} onClick={() => guard.request(() => router.push(loginHref()))}>取消注册</LButton>
    </LForm>
    <Link href={loginHref()} className={styles.accountLink}>已有账号？返回登录</Link>
    <LP className={styles.demo}>{mockAuthEnabled ? "仅使用虚构的 .test 邮箱与测试资料。本地账号只保存在内存，刷新后失效；不发送真实邮件。测试验证码为 004271。" : "注册、邮件和人机验证服务尚未接入，本页面不创建真实账号。"}</LP>
    <LDialog ref={dialog} className={styles.guard} aria-labelledby="leave-title" onCancel={event => { event.preventDefault(); guard.continueEditing(); }}>
      <LH2 id="leave-title">离开后信息不会被保存</LH2><LDiv className={styles.guardActions}>
        <LButton ref={continueButton} type="button" className={styles.secondary} onClick={guard.continueEditing}>继续填写</LButton>
        <LButton type="button" className={styles.secondary} onClick={guard.confirm}>确认离开</LButton>
      </LDiv>
    </LDialog>
  </LSection></LDiv>;
}

function ProfileInput({ field, label, type, autoComplete, value, error, disabled, onValueChange }: {
  field: string; label: string; type: string; autoComplete: string; value: string; error?: string; disabled: boolean; onValueChange: (value: string) => void;
}) {
  return <LDiv className={styles.field}><LLabel htmlFor={`register-${field}`}>{label}</LLabel>
    <LoginInput id={`register-${field}`} type={type} autoComplete={autoComplete} required value={value} disabled={disabled} onChange={event => onValueChange(event.target.value)} aria-invalid={!!error} aria-describedby={`register-${field}-error`} />
    <LP id={`register-${field}-error`} className={`${styles.feedback} ${styles.error}`} hidden={!error}>{error}</LP>
  </LDiv>;
}
