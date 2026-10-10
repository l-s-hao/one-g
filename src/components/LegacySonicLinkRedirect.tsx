"use client";

import { LDiv, LP } from "@/i18n/Elements";

import { LocalizedLink as Link } from "@/i18n/Elements";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Exported HTML compatibility; no server redirects or purchasing components. */
export default function LegacySonicLinkRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/solutions/teleoperation"); }, [router]);
  return <LDiv className="p-8"><LP role="status">SONIC Link 已归入遥操作解决方案。</LP><Link className="underline" href="/solutions/teleoperation">了解遥操作方案</Link></LDiv>;
}
