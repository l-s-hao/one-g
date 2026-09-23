"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eye, ChevronDown, Menu, Search, ShoppingCart, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { navigation } from "@/data/site-navigation";
import { getProducts } from "@/lib/products";
import { useAuth } from "./AuthProvider";
import { NavigationLink } from "./ProtectedLink";
import ThemeSelector from "./ThemeSelector";
import BrandLogo from "./BrandLogo";
import styles from "./HeaderBrand.module.css";

const searchItems = [...navigation, ...getProducts().map(product => ({
  label: product.name,
  href: `/products/${product.slug}`,
}))];

export default function Header() {
  const pathname = usePathname();
  // Remount on navigation, including browser back, so panels and focus state cannot leak to another page.
  return <HeaderNavigation key={pathname} pathname={pathname.replace(/\/+$/, "") || "/"} />;
}

function HeaderNavigation({ pathname }: { pathname: string }) {
  const { currentUser } = useAuth();
  const [panel, setPanel] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const root = useRef<HTMLElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const close = (restore = false) => {
    clearTimers(); setPanel(null); setMobileOpen(false);
    if (restore) {
      if (mobileOpen) root.current?.querySelector<HTMLButtonElement>(`button[aria-controls="mobile-navigation"]`)?.focus();
      else opener.current?.focus();
    }
  };
  const toggle = (id: string, button: HTMLButtonElement) => {
    clearTimers(); opener.current = button;
    setPanel(value => value === id ? null : id);
  };
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) {
        clearTimers(); setPanel(null); setMobileOpen(false);
      }
    };
    const media = window.matchMedia("(min-width: 1024px)");
    const resize = () => {
      clearTimers(); setPanel(null); setMobileOpen(false);
      const active = document.activeElement;
      if (active instanceof HTMLElement && root.current?.contains(active)) active.blur();
    };
    document.addEventListener("pointerdown", outside);
    media.addEventListener("change", resize);
    return () => { clearTimers(); document.removeEventListener("pointerdown", outside); media.removeEventListener("change", resize); };
  }, []);
  const active = navigation.find(item => item.href === panel);
  const userHref = !currentUser ? "/login" : currentUser.role === "ADMIN" ? "/admin" : "/account";
  const userLabel = !currentUser ? "用户登录" : currentUser.role === "ADMIN" ? "管理后台" : "用户中心";
  const current = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const groups = (item: typeof navigation[number]) => <div className={styles.groups}>
    {item.groups?.map(group => <div key={group.label}><p className={styles.groupTitle}>{group.label}</p><ul>{group.links.map(link => <li key={link.href}><Link href={link.href} onClick={() => close()}>{link.label}</Link></li>)}</ul></div>)}
  </div>;
  return <header ref={root} className={`site-header ${styles.header}`}
    onPointerEnter={() => { if (closeTimer.current) clearTimeout(closeTimer.current); }}
    onPointerLeave={event => {
      if (event.pointerType !== "mouse" || !window.matchMedia("(min-width: 1024px)").matches) return;
      if (openTimer.current) clearTimeout(openTimer.current);
      closeTimer.current = setTimeout(() => {
        // Keep keyboard focus visible even if the pointer leaves the header.
        if (!root.current?.contains(document.activeElement)) setPanel(null);
      }, 180);
    }}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) { clearTimers(); setPanel(null); setMobileOpen(false); } }}
    onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); close(true); } }}>
    <div className={styles.row}>
      <Link href="/" className={styles.brand} aria-label="ONE-G / 万机智能 首页" onClick={() => close()}>
        <BrandLogo variant="horizontal" size="sm" context="header" className={styles.desktopLogo}/>
        <BrandLogo variant="mark" size="sm" context="header" className={styles.mobileLogo}/>
      </Link>
      <nav className={styles.navigation} aria-label="主导航">
        {navigation.map((item, index) => <div className={styles.navItem} key={item.href}
          onPointerEnter={event => {
            if (event.pointerType !== "mouse") return;
            clearTimers();
            const button = event.currentTarget.querySelector("button");
            openTimer.current = setTimeout(() => { opener.current = button; setPanel(item.groups ? item.href : null); }, 120);
          }}>
          <Link href={item.href} aria-current={current(item.href) ? "page" : undefined} onClick={() => close()}>{item.label}</Link>
          {item.groups && <button type="button" aria-label={`展开${item.label}`} aria-expanded={panel === item.href} aria-controls={`desktop-nav-${index}`} onClick={event => toggle(item.href, event.currentTarget)}><ChevronDown size={14}/></button>}
        </div>)}
      </nav>
      <div className={styles.actions} aria-label="快捷入口">
        <button type="button" aria-label="显示设置" title="显示设置" aria-expanded={panel === "accessibility"} aria-controls="header-accessibility" onClick={event => toggle("accessibility", event.currentTarget)}><Eye size={19}/></button>
        <button type="button" aria-label="搜索" aria-expanded={panel === "search"} aria-controls="header-search" onClick={event => toggle("search", event.currentTarget)}><Search size={19}/></button>
        <NavigationLink className={styles.user} href={userHref} aria-label={userLabel} onClick={() => close()}><UserRound size={19}/></NavigationLink>
        <NavigationLink href="/cart" aria-label="购物车" onClick={() => close()}><ShoppingCart size={19}/></NavigationLink>
        <button className={styles.menuButton} type="button" aria-label={mobileOpen ? "关闭菜单" : "打开菜单"} aria-expanded={mobileOpen} aria-controls="mobile-navigation" onClick={event => {
          clearTimers(); opener.current = event.currentTarget; setMobileOpen(value => !value); setPanel(null);
        }}>{mobileOpen ? <X size={20}/> : <Menu size={20}/>}</button>
      </div>
    </div>
    {navigation.map((item,index) => item.groups && <div key={item.href} id={`desktop-nav-${index}`} className={`${styles.panel} ${styles.desktopPanel}`} hidden={panel !== item.href}>
      <div className={styles.panelInner}>{active?.href === item.href && groups(item)}</div>
    </div>)}
    <div id="mobile-navigation" className={`${styles.panel} ${styles.mobilePanel}`} hidden={!mobileOpen || panel === "search" || panel === "accessibility"}>
      <nav className={styles.panelInner} aria-label="移动端导航">{navigation.map((item,index) => <div className={styles.mobileGroup} key={item.href}>
        <div className={styles.mobileHeading}><Link href={item.href} aria-current={current(item.href) ? "page" : undefined} onClick={() => close()}>{item.label}</Link>{item.groups && <button type="button" aria-label={`展开${item.label}`} aria-expanded={panel === item.href} aria-controls={`mobile-nav-${index}`} onClick={event => toggle(item.href,event.currentTarget)}><ChevronDown size={17}/></button>}</div>
        {item.groups && <div id={`mobile-nav-${index}`} hidden={panel !== item.href}>{groups(item)}</div>}
      </div>)}<NavigationLink className={styles.mobileAccount} href={userHref} onClick={() => close()}><UserRound size={18}/>{userLabel}</NavigationLink></nav>
    </div>
    <div id="header-search" className={styles.panel} hidden={panel !== "search"}><div className={styles.panelInner}>
      <div className={styles.panelHeading}><label htmlFor="site-search">搜索 ONE-G</label><button type="button" aria-label="关闭搜索" onClick={() => close(true)}><X size={20}/></button></div>
      <input id="site-search" type="search" placeholder="搜索产品或栏目" value={query} onChange={event => setQuery(event.target.value)}/>
      <ul className={styles.searchResults}>{searchItems.filter(item => !query.trim() || item.label.toLowerCase().includes(query.trim().toLowerCase())).map(item => <li key={item.href}><Link href={item.href} onClick={() => close()}>{item.label}</Link></li>)}</ul>
      {query.trim() && !searchItems.some(item => item.label.toLowerCase().includes(query.trim().toLowerCase())) && <p>没有匹配的产品或栏目。</p>}
    </div></div>
    <div id="header-accessibility" className={`${styles.panel} ${styles.displayPanel}`} hidden={panel !== "accessibility"}><div className={styles.panelInner}><div className={styles.panelHeading}><span>显示设置</span><button type="button" aria-label="关闭显示设置" onClick={() => close(true)}><X size={20}/></button></div><ThemeSelector compact /></div></div>
  </header>;
}
