"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/** Public static-export compatibility for retired configuration URLs. */
export default function LegacyConfigurationRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/configure"); }, [router]);
  return <div className="p-8"><p role="status">正在打开 ONE-G 系统配置…</p><Link href="/configure" className="underline">查看系统配置</Link></div>;
}
