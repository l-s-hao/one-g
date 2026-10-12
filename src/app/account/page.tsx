"use client";

import { LDiv, LH1, LH2, LP, LSection } from "@/i18n/Elements";


import AccountOrders from "@/components/AccountOrders";
import { LocalizedLink as Link } from "@/i18n/Elements";
import { useAuth } from "@/components/AuthProvider";
import AccountActions from "@/components/AccountActions";
import SupportButton from "@/components/SupportButton";
import styles from "./account.module.css";

export default function AccountPage() {
  const { currentUser } = useAuth();
  if (!currentUser) return null;
  return <LDiv className={styles.page}>
    <LH1 className="account-title text-3xl font-semibold">用户中心</LH1>
    <LSection className={styles.section} aria-labelledby="account-info">
      <LH2 id="account-info">用户资料</LH2>
      <LP>邮箱：{currentUser.email}</LP>
      <LP className={styles.muted}>用户名：未设置</LP>
      <LP className={styles.muted}>普通用户</LP>
    </LSection>
    <LSection className={styles.section}><LH2>我的订单</LH2><AccountOrders key={currentUser.id} userId={currentUser.id}/></LSection>
    <LSection className={styles.section}><LH2>购物车</LH2><Link intent="ordinary" href="/cart">查看购物车</Link></LSection>
    <LSection className={styles.section}><LH2>收货地址</LH2><LP className={styles.muted}>地址管理暂未开放。</LP></LSection>
    <LSection className={styles.section} aria-labelledby="account-support"><LH2 id="account-support">客服咨询</LH2><SupportButton inline entry="account"/></LSection>
    <LSection className={styles.section} aria-labelledby="account-actions"><LH2 id="account-actions">账户</LH2><AccountActions /></LSection>
  </LDiv>;
}
