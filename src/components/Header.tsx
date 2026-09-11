"use client";

import Link from "next/link";
import { NavigationLink } from "./ProtectedLink";
import { Menu, Search, ShoppingCart, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import styles from "./HeaderBrand.module.css";
import AccessibilityControls from "./AccessibilityControls";
import BrandLogo from "./BrandLogo";



const navigation = [
  { href: "/customize/start", label: "在线定制" },
  { href: "/products", label: "商品中心" },
  { href: "/about", label: "了解公司" },
];

const utilityLinks = [
  { href: "/#search", label: "搜索", Icon: Search },
  { href: "/login", label: "用户登录", Icon: UserRound },
  { href: "/cart", label: "购物车", Icon: ShoppingCart },
];

export default function Header() {
  const { currentUser } = useAuth();
  const userHref = !currentUser ? "/login" : currentUser.role === "ADMIN" ? "/admin" : "/account";
  const userLabel = !currentUser ? "用户登录" : currentUser.role === "ADMIN" ? "管理后台" : "用户中心";
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
    <header data-header-variant={isHome ? "hero" : "interior"} className={`site-header ${isHome ? "fixed" : "sticky"} inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${isHome ? (scrolled ? "border-white/10 bg-black/80 backdrop-blur-xl" : "border-white/10 bg-transparent") : "border-zinc-200/80 bg-white/85 backdrop-blur-xl"}`}>
      <div className={`container-shell flex items-center justify-between gap-6 md:grid md:grid-cols-[1fr_auto_1fr] ${styles.row}`}>
        <Link href="/" className={`shrink-0 justify-self-start ${styles.brand} ${isHome ? "" : styles.interior}`} aria-label="ONE-G / 万机智能 首页" onClick={() => setMenuOpen(false)}>
          <BrandLogo variant="horizontal" size="sm" context={isHome ? "brand" : "header"} className={styles.desktopLogo} />
          <BrandLogo variant="mark" size="sm" context={isHome ? "brand" : "header"} className={styles.mobileLogo} />
        </Link>

        <nav className={`hidden items-center justify-center md:flex ${styles.navigation} ${isHome ? "text-white/75" : "text-zinc-600"}`} aria-label="主导航">
          {navigation.map((item) => (
            <NavigationLink key={item.href} href={item.href} className={`transition-colors ${isHome ? "hover:text-white" : "hover:text-zinc-950"}`}>
              {item.label}
            </NavigationLink>
          ))}
        </nav>

        <div className={`hidden items-center justify-self-end gap-5 md:flex ${styles.actions} ${isHome ? "text-white/75" : "text-zinc-600"}`} aria-label="快捷入口">
          <AccessibilityControls />
          {utilityLinks.map(({ href, label, Icon }) => (
            <NavigationLink key={href} href={href === "/login" ? userHref : href} aria-label={href === "/login" ? userLabel : label} className={`transition-colors ${isHome ? "hover:text-white" : "hover:text-blue-600"}`}>
              <Icon size={19} strokeWidth={1.7} />
            </NavigationLink>
          ))}
        </div>

        <div className="flex items-center gap-2 md:hidden">
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
      </div>

      {menuOpen && (
        <div className={`border-t px-6 py-5 md:hidden ${isHome ? "border-white/10 bg-black/95" : "border-zinc-200/80 bg-white"}`}>
          <nav className="container-shell flex flex-col gap-1" aria-label="移动端导航">
            {navigation.map((item) => (
              <NavigationLink key={item.href} href={item.href} className={`rounded-xl px-3 py-3 text-sm ${isHome ? "text-white/80 hover:bg-white/10" : "text-zinc-700 hover:bg-zinc-50"}`} onClick={() => setMenuOpen(false)}>
                {item.label}
              </NavigationLink>
            ))}
            <AccessibilityControls mobile />
            <div className={`mt-2 flex gap-2 border-t pt-3 ${isHome ? "border-white/10" : "border-zinc-100"}`}>
              {utilityLinks.map(({ href, label, Icon }) => (
                <NavigationLink key={href} href={href === "/login" ? userHref : href} className={`flex items-center gap-2 rounded-xl px-3 py-3 text-sm ${isHome ? "text-white/70 hover:bg-white/10" : "text-zinc-600 hover:bg-zinc-50"}`} onClick={() => setMenuOpen(false)}>
                  <Icon size={17} strokeWidth={1.7} />
                  {href === "/login" ? userLabel : label}
                </NavigationLink>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
