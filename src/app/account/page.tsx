"use client";

import AccountOrders from "@/components/AccountOrders";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import ThemeSelector from "@/components/ThemeSelector";
import AccountActions from "@/components/AccountActions";
import ContactDetails from "@/components/ContactDetails";
import styles from "./account.module.css";

export default function AccountPage() {
  const { currentUser } = useAuth();
  if (!currentUser) return null;
  return <div className={styles.page}>
    <h1 className="account-title text-3xl font-semibold">用户中心</h1>
    <section className={styles.section} aria-labelledby="account-info">
      <h2 id="account-info">用户资料</h2>
      <p>邮箱：{currentUser.email}</p>
      <p className={styles.muted}>用户名：未设置</p>
      <p className={styles.muted}>普通用户</p>
    </section>
    <section className={styles.section}><h2>我的订单</h2><AccountOrders key={currentUser.id} userId={currentUser.id}/></section>
    <section className={styles.section}><h2>购物车</h2><Link href="/cart">查看购物车</Link></section>
    <section className={styles.section}><h2>收货地址</h2><p className={styles.muted}>地址管理暂未开放。</p></section>
    <section className={styles.section} aria-labelledby="account-support"><h2 id="account-support">客服咨询</h2><ContactDetails actions /></section>
    <section className={styles.section} aria-labelledby="personalization-title">
      <p className={styles.eyebrow}>APPEARANCE</p>
      <h2 id="personalization-title">外观与显示辅助</h2>
      <ThemeSelector />
    </section>
    <section className={styles.section} aria-labelledby="account-actions"><h2 id="account-actions">账户</h2><AccountActions /></section>
  </div>;
}
