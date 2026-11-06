"use client";

import { LButton, LDiv, LNav } from "@/i18n/Elements";


import { useLocale } from "@/i18n/LocaleProvider";
import DisplaySettings from "./DisplaySettings";
import languageStyles from "./LanguageSwitch.module.css";
import { LocalizedLink as Link } from "@/i18n/Elements";
import { useAppPathname } from "@/lib/use-app-pathname";
import { Search, ShoppingCart, UserRound } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { navigation } from "@/data/site-navigation";
import { useAuth } from "./AuthProvider";
import { NavigationLink } from "./ProtectedLink";
import HeaderLogo from "./HeaderLogo";
import SearchBox from "./SearchBox";
import HeaderPanel from "./HeaderPanel";
import HeaderImageMenu from "./HeaderImageMenu";
import useNavigationHighlight from "./useNavigationHighlight";
import { Navbar, NavBody, NavItems, NavbarLogo, MobileNavToggle } from "./ui/resizable-navbar";
import styles from "./HeaderBrand.module.css";

export default function Header() {
  const pathname = useAppPathname();
  // Remount on navigation, including browser back, so panels and focus state cannot leak to another page.
  return <HeaderNavigation key={pathname} pathname={pathname} />;
}

function HeaderNavigation({ pathname }: { pathname: string }) {
  const { currentUser } = useAuth();
  const { locale } = useLocale();
  const [panel, setPanel] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const root = useRef<HTMLElement>(null);
  const current = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const { nav, position: highlightPosition, restore: restoreHighlight } = useNavigationHighlight(navigation.find(item => current(item.href))?.href, locale, pathname);
  const opener = useRef<HTMLElement | null>(null);
  const restoringFocus = useRef(false);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keyboardInteraction = useRef(false);
  const clearTimers = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = null; closeTimer.current = null;
  }, []);
  const close = useCallback((restore = false) => {
    clearTimers(); setPanel(null); setMobileOpen(false); restoreHighlight();
    if (restore) {
      restoringFocus.current = true;
      if (mobileOpen) root.current?.querySelector<HTMLButtonElement>(`button[aria-controls="mobile-navigation"]`)?.focus();
      else opener.current?.focus();
      restoringFocus.current = false;
    }
  }, [clearTimers, mobileOpen, restoreHighlight]);
  useEffect(() => {
    if (!panel && !mobileOpen) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      event.preventDefault();
      keyboardInteraction.current = true;
      close(true);
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [panel, mobileOpen, close]);
  const toggle = (id: string, button: HTMLElement) => {
    clearTimers(); opener.current = button;
    setPanel(value => value === id ? null : id);
  };
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) {
        clearTimers(); setPanel(null); setMobileOpen(false); restoreHighlight();
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
  }, [restoreHighlight, clearTimers]);
  useEffect(() => {
    if (panel === "search") root.current?.querySelector<HTMLInputElement>("#site-search")?.focus();
  }, [panel]);
  const userHref = !currentUser ? "/login" : currentUser.role === "ADMIN" ? "/admin" : "/account";
  const userLabel = !currentUser ? "用户登录" : currentUser.role === "ADMIN" ? "管理后台" : "用户中心";
  return <><div className={styles.spacer} aria-hidden="true" data-navbar-spacer /><Navbar ref={root} className={`site-header ${styles.header}`} data-open={panel !== null || mobileOpen} data-search-open={panel === "search"} data-navigation-path={pathname}
    onPointerDown={() => { keyboardInteraction.current = false; }}
    onPointerEnter={() => { if (closeTimer.current) clearTimeout(closeTimer.current); }}
    onPointerLeave={event => {
      if (document.documentElement.dataset.magicuiThemeVt === "active") return;
      if (event.pointerType !== "mouse" || !window.matchMedia("(min-width: 1024px)").matches) return;
      if (openTimer.current) clearTimeout(openTimer.current);
      if (panel === "search" || panel === "settings") return;
      closeTimer.current = setTimeout(() => {
        // Keep keyboard focus visible even if the pointer leaves the header.
        if (!keyboardInteraction.current || !root.current?.contains(document.activeElement)) setPanel(null);
        if (!nav.current?.contains(document.activeElement) && !(keyboardInteraction.current && root.current?.contains(document.activeElement))) restoreHighlight();
      }, 180);
    }}
    onBlur={event => { if (document.documentElement.dataset.magicuiThemeVt === "active") return; if (!event.currentTarget.contains(event.relatedTarget)) { clearTimers(); setPanel(null); setMobileOpen(false); restoreHighlight(); } }}
    onKeyDown={event => { keyboardInteraction.current = true; if (event.key === "Escape") { event.preventDefault(); close(true); } }}>
    <NavBody className={styles.row}>
      <LDiv className={styles.leftTools}>
      <NavbarLogo href="/" className={styles.brand} aria-label="ONE-G / 万机智能 首页" onClick={() => close()}>
        <HeaderLogo desktopClassName={styles.desktopLogo} mobileClassName={styles.mobileLogo}/>
      </NavbarLogo>
      </LDiv>
      <NavItems ref={nav} className={styles.navigation} aria-label="主导航">
        <span className={styles.navigationHighlight} data-navigation-highlight aria-hidden="true" />
        {navigation.map((item, index) => <LDiv className={styles.navItem} key={item.href} data-navigation-item={item.href}
          onFocus={event => {
            highlightPosition(item.href);
            if (restoringFocus.current || !event.target.matches(":focus-visible")) return;
            clearTimers();
            opener.current = event.target;
            setPanel(item.groups ? item.href : null);
          }}
          onPointerEnter={event => {
            if (event.pointerType !== "mouse" || !window.matchMedia("(min-width:1024px) and (hover:hover) and (pointer:fine)").matches) return;
            highlightPosition(item.href);
            keyboardInteraction.current = false;
            clearTimers();
            const link = event.currentTarget.querySelector("a");
            openTimer.current = setTimeout(() => { opener.current = link; setPanel(item.groups ? item.href : null); }, 120);
          }}>
          <Link href={item.href} aria-current={current(item.href) ? "page" : undefined}
            aria-expanded={item.groups ? panel === item.href : undefined}
            aria-controls={item.groups ? `desktop-nav-${index}` : undefined}
            onKeyDown={event => {
              // Tab enters the preview opened by keyboard focus; Enter remains
              // the Link's native navigation. Escape closes and restores this Link.
              if (event.key !== "Tab" || event.shiftKey || !item.groups || panel !== item.href) return;
              const first = root.current?.querySelector<HTMLAnchorElement>(`#desktop-nav-${index} a`);
              if (first) { event.preventDefault(); first.focus(); }
            }}
            onClick={() => close()}>{item.label}</Link>
        </LDiv>)}
      </NavItems>
      <LDiv className={styles.actions} aria-label="快捷入口" onFocus={() => { if (!navigation.some(item => item.href === panel)) restoreHighlight(); }}>
      <LButton className={styles.searchTrigger} type="button" aria-label="搜索" aria-expanded={panel === "search"} aria-controls="header-search" onClick={event => { setMobileOpen(false); toggle("search", event.currentTarget); }}><Search size={18} aria-hidden="true"/></LButton>
        <NavigationLink className={styles.user} href={userHref} aria-label={userLabel} onClick={() => close()}><UserRound size={18}/></NavigationLink>
        <NavigationLink href="/cart" aria-label="购物车" onClick={() => close()}><ShoppingCart size={18}/></NavigationLink>
        <MobileNavToggle isOpen={mobileOpen} className={styles.menuButton} aria-label={mobileOpen ? "关闭菜单" : "打开菜单"} aria-expanded={mobileOpen} aria-controls="mobile-navigation" onClick={event => {
          clearTimers(); opener.current = event.currentTarget; setMobileOpen(value => !value); setPanel(null);
        }} />
        <LButton className={styles.settingsTrigger} type="button" data-display-settings aria-label="显示设置" aria-expanded={panel === "settings"} aria-controls="header-display-settings" onClick={event => { setMobileOpen(false); toggle("settings", event.currentTarget); }}><span className={languageStyles.icon} aria-hidden="true"/></LButton>
      </LDiv>
    </NavBody>
    {navigation.map((item,index) => item.groups && <HeaderPanel key={item.href} id={`desktop-nav-${index}`} className={`${styles.panel} ${styles.desktopPanel} ${styles.imagePanel}`} open={panel === item.href}>
      <LDiv className={styles.panelInner}><HeaderImageMenu kind={item.href === "/products" ? "products" : "solutions"} open={panel === item.href} onClose={() => close(true)} onNavigate={() => close()}/></LDiv>
    </HeaderPanel>)}
    <HeaderPanel id="mobile-navigation" className={`${styles.panel} ${styles.mobilePanel}`} open={mobileOpen && panel !== "search"}>
      <LNav className={styles.panelInner} aria-label="移动端导航">{navigation.map((item,index) => <LDiv className={styles.mobileGroup} key={item.href}>
        <LDiv className={styles.mobileHeading}>
          <Link href={item.href} aria-current={current(item.href) ? "page" : undefined} onClick={() => close()}>{item.label}</Link>
          {item.groups && <LButton className={styles.previewToggle} effect="invert" effectVariant="secondary" type="button"
            aria-expanded={panel === item.href} aria-controls={`mobile-nav-${index}`}
            aria-label={`${item.label}：${panel === item.href ? "收起预览" : "展开预览"}`}
            onClick={event => toggle(item.href, event.currentTarget)}>{panel === item.href ? "收起预览" : "展开预览"}</LButton>}
        </LDiv>
        {item.groups && <HeaderPanel id={`mobile-nav-${index}`} open={panel === item.href}><HeaderImageMenu kind={item.href === "/products" ? "products" : "solutions"} open={mobileOpen && panel === item.href} onClose={() => { setPanel(null); opener.current?.focus(); }} onNavigate={() => close()}/></HeaderPanel>}
      </LDiv>)}<NavigationLink className={styles.mobileAccount} href={userHref} onClick={() => close()}><UserRound size={18}/>{userLabel}</NavigationLink></LNav>
    </HeaderPanel>
    <HeaderPanel id="header-display-settings" className={`${styles.panel} ${styles.settingsPanel}`} open={panel === "settings"}><DisplaySettings /></HeaderPanel>
    <HeaderPanel id="header-search" className={`${styles.panel} ${styles.searchPanel}`} open={panel === "search"} duration={300} fitViewport><LDiv className={styles.searchInner}>
      <SearchBox id="site-search" active={panel === "search"} query={query} onQueryChange={setQuery} onNavigate={() => close()} onClose={() => close(true)}/>
    </LDiv></HeaderPanel>
  </Navbar></>;
}
