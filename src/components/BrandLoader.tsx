"use client";

import type { ReactNode } from "react";
import { LSpan } from "@/i18n/Elements";
import styles from "./BrandLoader.module.css";

type Props = {
  active?: boolean;
  size?: "page" | "section" | "compact";
  label?: string;
  announce?: boolean;
  className?: string;
};

/** 只呈现调用方的真实等待；CSS的150ms防闪烁不推迟请求、完成或页面更新；卸载直接移除动画，无异步回调。 */
export default function BrandLoader({ active = true, ...props }: Props) {
  return active ? <DelayedLoader {...props} /> : null;
}

function DelayedLoader({ size = "section", label = "加载中…", announce = true, className = "" }: Omit<Props, "active">) {
  return <span className={`${styles.root} ${styles[size]} ${className}`} data-brand-loader={size}
    role={announce ? "status" : undefined} aria-hidden={!announce ? true : undefined}>
    <span className={styles.stage} aria-hidden="true">
      <span className={styles.mark}/>
      {size !== "compact" && <><span className={styles.mark}/><span className={styles.mark}/>
        <span className={styles.shadow}/><span className={styles.shadow}/><span className={styles.shadow}/></>}
    </span>
    {announce && <LSpan className={size === "compact" ? styles.srOnly : styles.label}>{label}</LSpan>}
  </span>;
}

/** 按钮始终预留16px图形槽；紧凑入口保留原操作名称，不重复播报品牌。 */
export function PendingLabel({ active, children }: { active: boolean; children: ReactNode }) {
  return <span className={styles.pendingLabel}><span className={styles.slot} aria-hidden="true"><BrandLoader active={active} size="compact" announce={false}/></span><LSpan>{children}</LSpan></span>;
}
