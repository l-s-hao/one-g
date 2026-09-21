"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { getOfferingNavigation } from "@/lib/offering-navigation";
import styles from "./ProductLocalNav.module.css";

type Props = { name: string; links: ReturnType<typeof getOfferingNavigation>; view: "overview" | "specs" };
export default function ProductLocalNav({ name, links, view }: Props) {
  const [pastHero, setPastHero] = useState(view === "specs");
  const [nearFooter, setNearFooter] = useState(false);
  const [focused, setFocused] = useState(false);
  const [open, setOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(64);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const id = useId();
  const visible = (pastHero && !nearFooter) || focused;
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("header.site-header");
    const measure = () => {
      const height = header?.getBoundingClientRect().height ?? 64;
      setHeaderHeight(height);
      root.current?.closest<HTMLElement>("[data-product-page]")?.style.setProperty("--product-header-height", `${height}px`);
    };
    const resize = new ResizeObserver(measure);
    if (header) resize.observe(header);
    measure();
    return () => resize.disconnect();
  }, []);
  useEffect(() => {
    const hero = document.getElementById("product-hero");
    const end = document.getElementById("product-content-end");
    // Observe the whole hero, using its stable bottom edge. This also catches
    // jumps that skip over a one-pixel sentinel between animation frames.
    const heroObserver = new IntersectionObserver(([entry]) => {
      setPastHero(entry.boundingClientRect.bottom <= headerHeight + 8);
    }, { rootMargin: `-${headerHeight + 8}px 0px 0px 0px`, threshold: 0 });
    const endObserver = new IntersectionObserver(([entry]) => {
      setNearFooter(entry.boundingClientRect.top <= headerHeight + 76);
    }, { rootMargin: `-${headerHeight + 76}px 0px 0px 0px`, threshold: 0 });
    if (view === "overview" && hero) heroObserver.observe(hero);
    if (end) endObserver.observe(end);
    return () => { heroObserver.disconnect(); endObserver.disconnect(); };
  }, [headerHeight, view]);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const reset = () => {
      setOpen(false);
      if (root.current?.contains(document.activeElement)) root.current.querySelector<HTMLAnchorElement>("a")?.focus();
    };
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false); };
    query.addEventListener("change", reset);
    document.addEventListener("pointerdown", outside);
    return () => { query.removeEventListener("change", reset); document.removeEventListener("pointerdown", outside); };
  }, []);
  return <div ref={root} className={styles.position} style={{ top: headerHeight + 8 }}
    onFocus={() => setFocused(true)}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) { setFocused(false); setOpen(false); } }}>
    <nav className={styles.nav} aria-label={`${name} 产品导航`} aria-hidden={!visible} inert={!visible} data-visible={visible}
      onKeyDown={event => { if (event.key === "Escape" && open) { event.preventDefault(); setOpen(false); toggle.current?.focus(); } }}>
      <Link className={styles.name} href={`${links.overviewHref}#product-top`} onClick={() => setOpen(false)}>{name}</Link>
      <div className={styles.right}>
        <button ref={toggle} type="button" className={styles.toggle} aria-expanded={open} aria-controls={id} aria-label="产品页面菜单" onClick={() => setOpen(value => !value)}>{view === "overview" ? "介绍" : "技术规格"}<ChevronDown size={14}/></button>
        <div id={id} className={styles.links} data-open={open}>
          <Link href={links.overviewHref} aria-current={view === "overview" ? "page" : undefined} onClick={() => setOpen(false)}>介绍</Link>
          <Link href={links.specsHref} aria-current={view === "specs" ? "page" : undefined} onClick={() => setOpen(false)}>技术规格</Link>
        </div>
        <Link className={styles.purchase} href={links.purchaseHref}>{links.purchaseLabel}</Link>
      </div>
    </nav>
  </div>;
}
