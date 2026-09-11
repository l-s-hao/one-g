"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import RequireRole from "@/components/RequireRole";
import styles from "./admin.module.css";

const sections = ["用户管理", "商品管理", "订单管理", "定制方案", "推荐规则"] as const;
function Dashboard() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const [section, setSection] = useState<string>("Dashboard");
  return <div className={styles.dashboard}>
    <div className={styles.toolbar}><div><h1>Dashboard</h1><p className={styles.muted}>{currentUser?.email} · ADMIN</p></div>
      <button type="button" onClick={() => { logout(); router.replace("/admin/login"); }}>退出登录</button>
    </div>
    <nav className={styles.navigation} aria-label="后台管理导航">
      {["Dashboard", ...sections].map(item => <button key={item} type="button" aria-pressed={section === item} aria-controls="admin-content" onClick={() => setSection(item)}>{item}</button>)}
    </nav>
    <section id="admin-content" className={styles.panel} aria-labelledby="admin-section-title">
      <h2 id="admin-section-title">{section === "Dashboard" ? "管理概览" : section}</h2>
      <p className={styles.muted}>{section === "Dashboard" ? "选择管理模块，预览后台工作区。" : "功能占位，暂未接入数据或增删改操作。"}</p>
      {section === "Dashboard" && <div className={styles.cards}>{sections.map(item => <button key={item} type="button" onClick={() => setSection(item)}><strong>{item}</strong><span>查看模块 →</span></button>)}</div>}
    </section>
  </div>;
}
export default function AdminPage() { return <RequireRole role="ADMIN"><Dashboard /></RequireRole>; }
