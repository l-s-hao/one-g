"use client";

import { LDiv, LP } from "@/i18n/Elements";

import { useEffect } from "react";
import { LocalizedLink as Link } from "@/i18n/Elements";
import { useRouter } from "next/navigation";
import { useAppPathname } from "@/lib/use-app-pathname";
import { canonicalConfigurationHref } from "@/lib/configuration-routing";

/** 旧书签仍需在 GitHub Pages 的静态 HTML 中可访问，故保留客户端兼容入口；目标由统一迁移规则决定。 */
export default function LegacyConfigurationRedirect() {
  const router = useRouter();
  const pathname = useAppPathname();
  useEffect(() => {
    router.replace(canonicalConfigurationHref(pathname + window.location.search + window.location.hash));
  }, [router, pathname]);
  return <LDiv className="p-8"><LP role="status">正在打开产品选购页面…</LP><Link intent="ordinary" href="/" >查看产品</Link></LDiv>;
}
