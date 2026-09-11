"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import styles from "../admin.module.css";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setMessage("");
    try {
      const result = await login(String(data.get("account") ?? ""), String(data.get("password") ?? ""), "ADMIN");
      if (result.ok) { form.reset(); router.replace("/admin"); }
      else setMessage(result.message);
    } catch { setMessage("登录暂时不可用，请重试。"); }
    finally { setPending(false); }
  };
  return <section className={styles.login} aria-labelledby="admin-login-title">
    <h1 id="admin-login-title">管理员登录</h1>
    <form onSubmit={submit} onChange={() => setMessage("")}>
      <label htmlFor="admin-account">管理员账号</label>
      <input id="admin-account" name="account" autoComplete="username" required placeholder="管理员账号" />
      <label htmlFor="admin-password">密码</label>
      <input id="admin-password" name="password" type="password" autoComplete="current-password" required placeholder="密码" />
      <button type="submit" disabled={pending}>{pending ? "正在登录…" : "进入管理后台"}</button>
      <p role="status" className={styles.message}>{message}</p>
    </form>
    <p className={styles.muted}>仅限授权人员访问</p>
    <p className={styles.demo}>演示账号：admin@one-g.com<br />演示密码：admin123<br />请勿输入真实管理员密码。</p>
  </section>;
}
