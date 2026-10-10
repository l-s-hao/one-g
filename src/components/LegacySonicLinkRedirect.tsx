"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Exported HTML compatibility; no server redirects or purchasing components. */
export default function LegacySonicLinkRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/solutions/teleoperation"); }, [router]);
  return <div className="p-8"><p role="status">SONIC Link 已归入遥操作解决方案。</p><Link className="underline" href="/solutions/teleoperation">了解遥操作方案</Link></div>;
}
