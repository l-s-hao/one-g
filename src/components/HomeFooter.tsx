import { navigation } from "@/data/site-navigation";
import Link from "next/link";

import BrandLogo from "./BrandLogo";
import { siteContent } from "@/data/site-content";

export default function HomeFooter() {
  const content = siteContent.footer;
  return (
    <footer id="site-footer" className="home-footer border-t border-white/10 bg-[#080808] py-10 text-white">
      <div className="home-content-shell">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_2fr]">
          <Link href="/" aria-label="ONE-G 万机智能 首页" className="w-fit self-start focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><BrandLogo variant="horizontal" /></Link>
          <nav aria-label="页脚导航" className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4">
            {[...navigation, { href: "/deep-customization", label: "深度定制" }].map(link => <Link key={link.href} href={link.href} className="py-2 text-sm text-white/70 hover:text-white">{link.label}</Link>)}
          </nav>
        </div>
        <p className="mt-8 border-t border-white/10 pt-5 text-xs text-white/40">{content.copyright}</p>
      </div>
    </footer>
  );
}
