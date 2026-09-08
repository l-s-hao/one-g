"use client";

import Link from "next/link";
import { Menu, Search, ShoppingCart, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/products", label: "产品中心" },
  { href: "/customize", label: "在线定制" },
  { href: "/#solutions", label: "解决方案" },
  { href: "/about", label: "了解公司" },
];

const utilityLinks = [
  { href: "/#search", label: "搜索", Icon: Search },
  { href: "/login", label: "用户登录", Icon: UserRound },
  { href: "/cart", label: "购物车", Icon: ShoppingCart },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!isHome) return;
    const update = () => setScrolled(window.scrollY > 20);
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [isHome]);

  return (
    <header className={`${isHome ? "fixed" : "sticky"} inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${isHome ? (scrolled ? "border-white/10 bg-black/80 backdrop-blur-xl" : "border-white/10 bg-transparent") : "border-zinc-200/80 bg-white/85 backdrop-blur-xl"}`}>
      <div className="container-shell flex min-h-16 items-center justify-between gap-6">
        <Link href="/" className={`shrink-0 text-xl font-extrabold tracking-[-0.04em] ${isHome ? "text-white" : "text-zinc-950"}`} onClick={() => setMenuOpen(false)}>
          ONE - G
        </Link>

        <nav className={`hidden items-center gap-8 text-sm md:flex ${isHome ? "text-white/75" : "text-zinc-600"}`} aria-label="主导航">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className={`transition-colors ${isHome ? "hover:text-white" : "hover:text-zinc-950"}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={`hidden items-center gap-5 md:flex ${isHome ? "text-white/75" : "text-zinc-600"}`} aria-label="快捷入口">
          {utilityLinks.map(({ href, label, Icon }) => (
            <Link key={href} href={href} aria-label={label} className={`transition-colors ${isHome ? "hover:text-white" : "hover:text-blue-600"}`}>
              <Icon size={18} strokeWidth={1.7} />
            </Link>
          ))}
        </div>

        <button
          type="button"
          className={`rounded-full p-2 transition-colors md:hidden ${isHome ? "text-white hover:bg-white/10" : "text-zinc-700 hover:bg-zinc-100"}`}
          aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={21} strokeWidth={1.8} /> : <Menu size={21} strokeWidth={1.8} />}
        </button>
      </div>

      {menuOpen && (
        <div className={`border-t px-6 py-5 md:hidden ${isHome ? "border-white/10 bg-black/95" : "border-zinc-200/80 bg-white"}`}>
          <nav className="container-shell flex flex-col gap-1" aria-label="移动端导航">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className={`rounded-xl px-3 py-3 text-sm ${isHome ? "text-white/80 hover:bg-white/10" : "text-zinc-700 hover:bg-zinc-50"}`} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
            <div className={`mt-2 flex gap-2 border-t pt-3 ${isHome ? "border-white/10" : "border-zinc-100"}`}>
              {utilityLinks.map(({ href, label, Icon }) => (
                <Link key={href} href={href} className={`flex items-center gap-2 rounded-xl px-3 py-3 text-sm ${isHome ? "text-white/70 hover:bg-white/10" : "text-zinc-600 hover:bg-zinc-50"}`} onClick={() => setMenuOpen(false)}>
                  <Icon size={17} strokeWidth={1.7} />
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
