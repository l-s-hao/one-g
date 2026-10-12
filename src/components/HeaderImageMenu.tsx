"use client";

// Layout concept: Codrops MenuToGrid (MIT), see docs/NAVIGATION.md.
import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { X } from "lucide-react";
import { LocalizedImage as Image, LocalizedLink as Link, LButton, LDiv, LP, LSpan } from "@/i18n/Elements";
import { getCatalogProducts, getProductStatusLabel, getCategories } from "@/lib/products";
import { solutions } from "@/data/solutions";
import type { ProductCategory } from "@/types/product";
import styles from "./HeaderImageMenu.module.css";

const products = getCatalogProducts().map(product => ({
  category: product.category, id: `header-product-${product.id}`, name: product.name, href: `/products/${product.slug}`,
  src: product.images[0], alt: product.detail?.imageNotes[0]?.alt ?? product.showcase?.imageAlt ?? product.name,
  note: product.status === "active" ? (product.id === "arm-a1" ? "型号待确认" : product.id === "g1" ? "产品图待确认" : "") : product.id === "robotdock" ? "概念图 · 暂未开放销售" : getProductStatusLabel(product.status),
}));
const menuCategories = [{ id: "all", name: "全部" }, ...getCategories().filter(category => ["robot", "arm", "hand", "vision"].includes(category.id))];
const solutionItems = solutions.map(solution => ({
  id: `header-solution-${solution.id}`, name: solution.content ? `${solution.name} · ${solution.content.name}` : solution.name,
  href: solution.detailHref ?? `/solutions#${solution.id}`, src: solution.media.src, alt: solution.media.alt, note: "",
}));

export default function HeaderImageMenu({ kind, open, onClose, onNavigate }: {
  kind: "products" | "solutions"; open: boolean; onClose: () => void; onNavigate: () => void;
}) {
  const [category, setCategory] = useState<ProductCategory | "all">("all");
  const items = kind === "products" ? products.filter(product => category === "all" || product.category === category) : solutionItems;
  const root = useRef<HTMLDivElement>(null);
  const [grid, setGrid] = useState(false);
  const pending = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const animation = useRef<gsap.core.Timeline | null>(null);
  useLayoutEffect(() => {
    const container = root.current;
    if (!container) return;
    gsap.registerPlugin(Flip);
    const cards = Array.from(container.querySelectorAll<HTMLElement>("[data-header-image-card]"));
    const stop = () => {
      animation.current?.kill(); animation.current = null;
      Flip.killFlipsOf(cards, false);
      gsap.set(cards, { clearProps: "transform,width,height,position,top,left" });
      container.removeAttribute("data-animating");
      container.removeAttribute("data-card-hover-disabled");
    };
    let frame = 0;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    if (!open) {
      stop(); pending.current = null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset the compact source layout only when the menu is closed.
      if (grid) setGrid(false);
      return stop;
    }
    if (!grid) {
      // Parent HeaderPanel makes the panel measurable in its layout effect.
      frame = requestAnimationFrame(() => {
        if (!container.getBoundingClientRect().width) return;
        container.setAttribute("data-card-hover-disabled", "true");
        pending.current = reduced.matches ? null : Flip.getState(cards);
        setGrid(true);
      });
    } else {
      const state = pending.current; pending.current = null;
      if (state && !reduced.matches) {
        container.setAttribute("data-animating", "true");
        container.setAttribute("data-card-hover-disabled", "true");
        try {
          animation.current = Flip.from(state, {
            duration: matchMedia("(max-width:1023px)").matches ? .4 : .5,
            ease: "power4.inOut", scale: true,
            stagger: { each: .025, amount: Math.min(.15, (cards.length - 1) * .025) },
            onComplete: () => { container.removeAttribute("data-animating"); container.removeAttribute("data-card-hover-disabled"); animation.current = null; },
          });
        } catch { stop(); }
      }
    }
    const finish = () => { animation.current?.progress(1); stop(); };
    window.addEventListener("resize", finish);
    reduced.addEventListener("change", finish);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", finish); reduced.removeEventListener("change", finish); stop(); };
  }, [open, grid, category]);
  return <LDiv className={styles.menu} data-header-image-menu={kind}>
    <LDiv className={styles.heading}>
      <Link href={`/${kind}`} onClick={onNavigate}>{kind === "products" ? "查看全部商品" : "查看全部方案"} →</Link>
      <LButton type="button" aria-label="关闭菜单" onClick={onClose}><X size={18}/></LButton>
    </LDiv>
    {kind === "products" && <LDiv className={styles.categories} role="group" aria-label="商品分类">
      {menuCategories.map(item => <LButton key={item.id} type="button" aria-pressed={category === item.id} onClick={() => {
        animation.current?.progress(1);
        setCategory(item.id as ProductCategory | "all");
      }}>{item.name}</LButton>)}
    </LDiv>}
    <LDiv ref={root} className={styles.grid} data-layout={grid ? "grid" : "thumbnails"}>
      {items.map(item => <Link key={item.id} href={item.href} className={styles.card} data-card-hover-host data-header-image-card data-flip-id={item.id} onClick={onNavigate}>
        <LDiv className={styles.surface} data-card-hover-surface>
        <LDiv className={styles.media}>{item.src ? <Image src={item.src} alt={item.alt} width={320} height={200} sizes="(max-width:1023px) 44vw, 260px" loading="lazy" onError={event => { event.currentTarget.hidden = true; event.currentTarget.parentElement?.setAttribute("data-image-failed", "true"); }}/>: null}
          <LSpan className={styles.placeholder} hidden={!!item.src}>图片待补</LSpan>
        </LDiv>
        <LDiv className={styles.copy}><LSpan>{item.name}</LSpan>{item.note && <LP>{item.note}</LP>}</LDiv>
        </LDiv>
      </Link>)}
      {items.length === 0 && <LP className={styles.empty}>该分类暂时没有商品。</LP>}
    </LDiv>
  </LDiv>;
}
