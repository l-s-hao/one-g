"use client";

import { useLoginForm } from "@/components/useLoginForm";
import InlineAuthError from "@/components/InlineAuthError";
import styles from "../admin.module.css";

export default function AdminLoginPage() {
  const { submit, clearErrors, pending, message, fields, invalidCredentials } = useLoginForm("ADMIN");
  return <section className={styles.login} aria-labelledby="admin-login-title">
    <h1 id="admin-login-title">管理员登录</h1>
    <form noValidate onSubmit={submit} onChange={clearErrors}>
      <label htmlFor="admin-account">管理员账号</label>
      <input id="admin-account" name="account" autoComplete="username" required placeholder="管理员账号" disabled={pending} aria-invalid={!!fields.account || invalidCredentials} aria-describedby="admin-account-error admin-login-error" />
      {fields.account && <InlineAuthError id="admin-account-error" message={fields.account} />}
      <label htmlFor="admin-password">密码</label>
      <input id="admin-password" name="password" type="password" autoComplete="current-password" required placeholder="密码" disabled={pending} aria-invalid={!!fields.password || invalidCredentials} aria-describedby="admin-password-error admin-login-error" />
      {fields.password && <InlineAuthError id="admin-password-error" message={fields.password} />}
      <InlineAuthError id="admin-login-error" message={message} />
      <button type="submit" disabled={pending}>{pending ? "正在登录…" : "进入管理后台"}</button>
    </form>
    <p className={styles.muted}>仅限授权人员访问</p>
    <p className={styles.demo}>演示账号：admin@one-g.com<br />演示密码：admin123<br />请勿输入真实管理员密码。</p>
  </section>;
}
