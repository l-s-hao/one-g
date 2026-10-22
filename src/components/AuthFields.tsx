"use client";
import { useState, type ComponentPropsWithRef } from "react";
import { LButton, LDiv, LLabel, LSpan } from "@/i18n/Elements";
import { useLocale, translate } from "@/i18n/LocaleProvider";
import { serviceRegions, type ServiceRegion } from "@/lib/auth/policy";
import { humanVerification } from "@/lib/auth/human";
import LoginInput from "./LoginInput";
import styles from "./VerificationLogin.module.css";
export function RegionField({ value, onChange, disabled = false }: { disabled?: boolean; value: ServiceRegion; onChange: (region: ServiceRegion) => void }) {
  const { locale } = useLocale();
  return <LDiv className={styles.field}><LLabel htmlFor="service-region">服务地区</LLabel>
    <select id="service-region" disabled={disabled} value={value} onChange={event => onChange(event.target.value as ServiceRegion)} className={styles.select} aria-describedby="region-help">
      {Object.entries(serviceRegions).map(([key, policy]) => <option key={key} value={key}>{translate(policy.label, locale)}</option>)}
    </select>
    <LSpan id="region-help" className={styles.feedback}>由您选择服务地区，不根据语言或精确位置判断。</LSpan>
  </LDiv>;
}
export function PasswordField({ id, label = "密码", ...props }: ComponentPropsWithRef<typeof LoginInput> & { id: string; label?: string }) {
  const [visible, setVisible] = useState(false);
  return <LDiv className={styles.field}><LLabel htmlFor={id}>{label}</LLabel><LDiv className={styles.passwordRow}>
    <LoginInput {...props} id={id} type={visible ? "text" : "password"} />
    <LButton type="button" className={styles.secondary} aria-controls={id} aria-pressed={visible} onClick={() => setVisible(value => !value)}>{visible ? "隐藏密码" : "显示密码"}</LButton>
  </LDiv></LDiv>;
}
export function HumanField({ ready, pending, disabled, onVerify }: { ready: boolean; pending: boolean; disabled: boolean; onVerify: () => void }) {
  return <LDiv className={styles.field}>
    <LSpan className={styles.feedback}>{humanVerification.mode === "mock" ? "开发演示：人机验证为模拟步骤，不代表真实反机器人防护。" : "人机验证服务尚未接入，暂不能发送真实验证码。"}</LSpan>
    <LButton type="button" className={styles.secondary} disabled={disabled || humanVerification.mode !== "mock"} onClick={onVerify}>{pending ? "验证中…" : ready ? "演示人机凭据已就绪（单次使用）" : "模拟人机验证（仅开发）"}</LButton>
  </LDiv>;
}
