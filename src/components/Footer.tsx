"use client";

import Link from "next/link";
import BrandLogo from "./BrandLogo";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <footer className="border-t border-white/10 bg-black px-6 py-8 text-center text-sm text-white/45">
      <nav aria-label="页脚业务导航" className="mb-5 flex flex-wrap justify-center gap-6"><Link href="/configure">配置</Link><Link href="/solutions">解决方案</Link><Link href="/deep-customization">深度定制</Link></nav>
      <Link href="/" aria-label="ONE-G 万机智能 首页" className="inline-block rounded focus-visible:outline-2 focus-visible:outline-offset-4"><BrandLogo variant="horizontal" /></Link>
    </footer>
  );
}
