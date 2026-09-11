"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import ThemeSelector from "@/components/ThemeSelector";
import AccountActions from "@/components/AccountActions";
import ContactDetails from "@/components/ContactDetails";
import styles from "./admin.module.css";

// Mock workspace entries only; management actions will use backend services later.
const modules = [
  { name: "用户管理", detail: "用户列表 · 用户状态" },
  { name: "商品管理", detail: "商品 · 类别 · 上下架" },
  { name: "订单管理", detail: "订单列表 · 订单状态" },
  { name: "定制方案管理", detail: "查看用户提交的定制方案，数据库接入后开放。" },
  { name: "推荐规则", detail: "场景推荐 · 模块推荐" },
  { name: "网站设置", detail: "客服信息 · 基础站点配置" },
] as const;

export default function AdminPage() {
  const { currentUser } = useAuth();
  const [section, setSection] = useState("Dashboard");
  const selected = modules.find(item => item.name === section);
  return <div className={styles.dashboard}>
    <header className={styles.toolbar}><div><p className={styles.muted}>ONE-G / ADMIN CENTER</p><h1>管理员中心</h1></div></header>
    <section className={styles.profile} aria-labelledby="admin-profile"><h2 id="admin-profile">管理员资料</h2><p className={styles.muted}>管理员邮箱：{currentUser?.email}</p><p className={styles.muted}>ADMIN</p></section>
    <nav className={styles.navigation} aria-label="后台管理导航">
      {["Dashboard", ...modules.map(item => item.name)].map(item => <button key={item} type="button" aria-pressed={section === item} aria-controls="admin-content" onClick={() => setSection(item)}>{item}</button>)}
    </nav>
    <section id="admin-content" className={styles.panel} aria-labelledby="admin-section-title">
      <h2 id="admin-section-title">{section === "Dashboard" ? "仪表盘 / Dashboard" : section}</h2>
      {section === "Dashboard" ? <>
        <p className={styles.muted}>管理功能预览。当前未连接正式数据。</p>
        <div className={styles.cards}>{modules.map(item => <button key={item.name} type="button" onClick={() => setSection(item.name)}><strong>{item.name}</strong><span>{item.detail}</span></button>)}</div>
      </> : section === "网站设置" ? <>
        <h3 className={styles.subheading}>当前客服信息</h3><ContactDetails />
        <h3 className={styles.subheading}>基础站点配置</h3><p className={styles.muted}>ONE-G / 万机智能 · 当前只读，编辑功能待后台服务接入。</p>
      </> : <><p>{selected?.detail}</p><p className={styles.muted}>功能占位，当前不读取真实数据、不执行增删改操作。</p></>}
    </section>
    <section className={styles.themeSection} aria-labelledby="admin-theme"><h2 id="admin-theme">个性化设置 / 界面主题</h2><p className={styles.muted}>仅影响当前管理员自己的界面，不改变全站默认或其他用户的主题。</p><ThemeSelector /></section>
    <section className={styles.accountSection} aria-labelledby="admin-account-actions"><h2 id="admin-account-actions">账户</h2><AccountActions /></section>
  </div>;
}
