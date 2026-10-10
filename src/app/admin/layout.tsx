import type { ReactNode } from "react";
import { LDiv, LHeader, LSpan, LP, LMain, LocalizedLink as Link } from "@/i18n/Elements";
import BrandLogo from "@/components/BrandLogo";
import styles from "./admin.module.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <LDiv className={styles.shell}>
    <LHeader className={styles.header}>
      <Link href="/" aria-label="ONE-G 万机智能 首页"><BrandLogo variant="horizontal" size="sm" /></Link>
      <LSpan>ADMIN CONSOLE</LSpan>
    </LHeader>
    <LP className={styles.prototype}>Frontend Authentication Prototype · 仅限前端演示，不用于正式认证或真实用户数据。</LP>
    <LMain>{children}</LMain>
  </LDiv>;
}
