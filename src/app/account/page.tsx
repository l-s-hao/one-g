"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import ThemeSelector from "@/components/ThemeSelector";
import styles from "./account.module.css";

export default function AccountPage() {
  const { currentUser, ready, logout } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (ready && !currentUser) router.replace("/login");
  }, [ready, currentUser, router]);
  if (!ready || !currentUser) return <p className={styles.loading} role="status">{ready ? "请登录后访问用户中心。" : "正在确认登录状态…"}</p>;
  return <div className={styles.page}>
    <h1 className="account-title text-3xl font-semibold">用户中心</h1>
    <section className={styles.section} aria-labelledby="account-info">
      <h2 id="account-info">账户信息</h2>
      <p>{currentUser.email}</p>
      <p className={styles.muted}>{currentUser.role === "ADMIN" ? "管理员" : "普通用户"}</p>
    </section>
    <section className={styles.section}><h2>我的订单</h2><p className={styles.muted}>暂无订单记录。</p></section>
    <section className={styles.section}><h2>我的配置</h2><Link href="/customize">进入配置工作台</Link></section>
    <section className={styles.section}><h2>收货地址</h2><p className={styles.muted}>地址管理暂未开放。</p></section>
    <section className={styles.section} aria-labelledby="personalization-title">
      <p className={styles.eyebrow}>PERSONALIZATION</p>
      <h2 id="personalization-title">个性化设置</h2>
      <h3 className={styles.subtitle}>网站主题</h3>
      <ThemeSelector />
    </section>
    <button className={styles.logout} type="button" onClick={() => { logout(); router.replace("/login"); }}>退出登录</button>
  </div>;
}
