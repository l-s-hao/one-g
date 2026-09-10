import Link from "next/link";
import { siteContent } from "@/data/site-content";

export default function HomeFooter() {
  const content = siteContent.footer;
  return (
    <footer id="site-footer" className="home-footer border-t border-white/10 bg-[#080808] py-10 text-white">
      <div className="home-content-shell">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_2fr]">
          <Link href="/" className="w-fit self-start text-xl font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">{content.brand}</Link>
          <nav aria-label="页脚导航" className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4">
            {content.groups.map(group => (
              <div key={group.title}>
                <h2 className="mb-3 text-sm font-semibold text-white/85">{group.title}</h2>
                <ul className="space-y-1">
                  {group.links.map(link => <li key={link.href}><Link href={link.href} className="inline-block py-1.5 text-sm text-white/50 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">{link.label}</Link></li>)}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <p className="mt-8 border-t border-white/10 pt-5 text-xs text-white/40">{content.copyright}</p>
      </div>
    </footer>
  );
}
