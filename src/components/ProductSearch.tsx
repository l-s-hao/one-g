"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { LButton } from "@/i18n/Elements";
import { trackSearchViewport } from "@/lib/search-viewport";
import SearchBox from "./SearchBox";
import styles from "./ProductSearch.module.css";

export default function ProductSearch() {
  const [open, setOpen] = useState(false), [query, setQuery] = useState("");
  const root = useRef<HTMLDivElement>(null), trigger = useRef<HTMLButtonElement>(null);
  const close = (restore = false) => { if (restore) trigger.current?.focus({ preventScroll: true }); setOpen(false); };
  useEffect(() => {
    if (!open) return;
    root.current?.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false); };
    // 顶栏获得键盘焦点/指针时交还浮层优先级；不按普通blur卸载候选链接。
    const headerInteraction = (event: Event) => { if(event.target instanceof Element && event.target.closest("[data-resizable-navbar]"))setOpen(false); };
    const escape = (event: globalThis.KeyboardEvent) => { if (event.key === "Escape" && !event.defaultPrevented) { event.preventDefault(); trigger.current?.focus({ preventScroll: true }); setOpen(false); } };
    const stopViewport = root.current ? trackSearchViewport(root.current,"bottom") : undefined;
    document.addEventListener("focusin", headerInteraction); document.addEventListener("pointerover", headerInteraction, { passive: true });
    document.addEventListener("pointerdown", outside); window.addEventListener("keydown", escape);
    return () => { stopViewport?.(); document.removeEventListener("focusin", headerInteraction); document.removeEventListener("pointerover", headerInteraction); document.removeEventListener("pointerdown", outside); window.removeEventListener("keydown", escape); };
  }, [open]);
  return <div ref={root} className={styles.root} data-product-search data-open={open}>
    <LButton ref={trigger} className={styles.trigger} type={open ? "submit" : "button"} form={open ? "catalog-search-form" : undefined} aria-label={open ? "执行搜索" : "搜索商品"} aria-expanded={open} aria-controls="catalog-search-box" onClick={event => { if (!open) { event.preventDefault(); setOpen(true); } }}><Search size={20} aria-hidden="true"/></LButton>
    <div className={styles.field} id="catalog-search-box">
      <SearchBox id="catalog-search" compact scope="products" active={open} query={query} onQueryChange={setQuery} onClose={() => close(true)} onNavigate={() => close()}/>
    </div>
  </div>;
}
