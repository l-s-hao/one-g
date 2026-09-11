import type { ReactNode } from "react";
import Link from "next/link";
import AccessibilityControls from "@/components/AccessibilityControls";
import BrandLogo from "@/components/BrandLogo";
import styles from "./admin.module.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className={styles.shell}>
    <header className={styles.header}>
      <Link href="/" aria-label="ONE-G 万机智能 首页"><BrandLogo variant="horizontal" size="sm" /></Link>
      <span>ADMIN CONSOLE</span>
      <AccessibilityControls />
    </header>
    <p className={styles.prototype}>Frontend Authentication Prototype · 仅限前端演示，不用于正式认证或真实用户数据。</p>
    <main>{children}</main>
  </div>;
}
