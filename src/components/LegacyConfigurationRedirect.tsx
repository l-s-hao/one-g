"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { canonicalConfigurationHref } from "@/lib/configuration-routing";

/** Public client redirect: compatible with exported HTML on GitHub Pages. */
export default function LegacyConfigurationRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    router.replace(canonicalConfigurationHref(pathname + window.location.search + window.location.hash));
  }, [router, pathname]);
  return <div className="p-8"><p role="status">正在打开产品选购页面…</p><Link href="/" className="underline">查看产品</Link></div>;
}
