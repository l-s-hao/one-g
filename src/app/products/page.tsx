"use client";

import { LButton, LDiv, LH1, LP, LSection, LSpan } from "@/i18n/Elements";


import { Suspense, useCallback, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getCategories, getCatalogProducts } from "@/lib/products";
import type { ProductCategory } from "@/types/product";
import styles from "./products.module.css";

const filterCategories = getCategories().filter(category => category.id !== "accessory");
const productCategories = [{ id: "all", name: "全部" }, ...filterCategories];
const catalogProducts = getCatalogProducts();

export default function ProductsPage() {
  return <Suspense fallback={<LP className="p-10 text-white/50">正在加载商品…</LP>}><ProductsByQuery /></Suspense>;
}

function ProductsByQuery() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = searchParams.get("category");
  const category = filterCategories.find(category => category.id === query)?.id ?? "all";
  const selectCategory = (nextCategory: ProductCategory | "all") => {
    // Push even the current URL category: an earlier navigation may still be
    // pending, and the user's latest click must supersede that request.
    const params = new URLSearchParams(searchParams.toString());
    if (nextCategory === "all") params.delete("category");
    else params.set("category", nextCategory);
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
  };
  return <ProductCatalog activeCategory={category} onCategoryChange={selectCategory} />;
}

function ProductCatalog({ activeCategory, onCategoryChange }: {
  activeCategory: ProductCategory | "all";
  onCategoryChange: (category: ProductCategory | "all") => void;
}) {
  const [layoutCategory, setLayoutCategory] = useState(activeCategory);
  const gridRef = useRef<HTMLElement>(null);
  const pendingRef = useRef<{ state: ReturnType<typeof Flip.getState>; height: number } | null>(null);
  const animationRef = useRef<gsap.core.Timeline | null>(null);
  const visibleProducts = getCatalogProducts(layoutCategory);
  const visibleIds = new Set(visibleProducts.map(product => product.id));

  const clearAnimation = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return;
    animationRef.current = null;
    gsap.set(Array.from(grid.children), { clearProps: "all" });
    gsap.set(grid, { clearProps: "height" });
    grid.inert = false;
    grid.removeAttribute("data-filter-animating");
  }, []);

  const finishAnimation = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return;
    // Complete the official Flip timeline, including its enter/leave tweens,
    // before measuring the next committed layout.
    Flip.killFlipsOf(Array.from(grid.children), true);
    animationRef.current?.progress(1).kill();
    clearAnimation();
  }, [clearAnimation]);

  useLayoutEffect(() => {
    gsap.registerPlugin(Flip);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    window.addEventListener("resize", finishAnimation);
    reducedMotion.addEventListener("change", finishAnimation);
    return () => {
      window.removeEventListener("resize", finishAnimation);
      reducedMotion.removeEventListener("change", finishAnimation);
      finishAnimation();
      pendingRef.current = null;
    };
  }, [finishAnimation]);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = Array.from(grid.children);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (layoutCategory !== activeCategory) {
      finishAnimation();
      pendingRef.current = reducedMotion ? null : {
        state: Flip.getState(cards),
        height: grid.getBoundingClientRect().height,
      };
      // A synchronous layout commit keeps React in charge of visibility attributes.
      // Both commits finish before paint; no timers or imperative display toggles.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Capture the old layout before React commits the new filter.
      setLayoutCategory(activeCategory);
      return;
    }
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (!pending || reducedMotion) return;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const duration = mobile ? 0.4 : 0.55;
    const stagger = mobile ? 0 : 0.04;
    const height = grid.getBoundingClientRect().height;
    // Moving links cannot be clicked or reached by keyboard until they settle.
    if (grid.contains(document.activeElement)) {
      grid.closest(".products-page")?.querySelector<HTMLButtonElement>('[role="tab"][aria-selected="true"]')?.focus({ preventScroll: true });
    }
    grid.inert = true;
    grid.setAttribute("data-filter-animating", "true");
    grid.style.height = `${height}px`;
    animationRef.current = Flip.from(pending.state, {
      duration, ease: "power1.inOut", scale: true, absolute: true,
      stagger, onComplete: clearAnimation,
      onEnter: elements => gsap.fromTo(elements, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration, stagger, ease: "power1.inOut" }),
      onLeave: elements => gsap.fromTo(elements, { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.96, duration, stagger, ease: "power1.inOut" }),
    });
    animationRef.current.fromTo(grid, { height: pending.height }, { height, duration, ease: "power1.inOut" }, 0);
  }, [activeCategory, layoutCategory, clearAnimation, finishAnimation]);
  return <LDiv className={`products-page min-h-screen w-full px-6 pb-24 sm:px-10 ${styles.catalogPage}`}>
    <LDiv className="mx-auto max-w-7xl">
      <LH1 id="products-title" className="text-4xl font-semibold tracking-tight sm:text-5xl">商品中心</LH1>
      <LP className={styles.description}>探索 ONE-G 的机器人、硬件与系统产品。</LP>
      <LDiv className="product-categories mt-12 flex flex-wrap gap-2 border-b border-white/10 pb-5" role="tablist" aria-label="商品分类">
        {productCategories.map(category => <LButton key={category.id} type="button" role="tab" aria-selected={activeCategory === category.id} onClick={() => onCategoryChange(category.id as ProductCategory | "all")} className={`rounded-full border px-5 py-2.5 text-sm ${styles.categoryButton} ${activeCategory === category.id ? "border-white bg-white text-black" : "border-white/15 text-white/60 hover:border-white/50 hover:text-white"}`}>{activeCategory === category.id && <LSpan aria-hidden="true">✓ </LSpan>}{category.name}</LButton>)}
      </LDiv>
      <LSection ref={gridRef} id="product-catalog" aria-label="商品列表" className={`product-grid mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3 ${styles.grid}`}>
        {catalogProducts.map(product => <ProductCard key={product.id} product={product} flipId={product.id} hidden={!visibleIds.has(product.id)} />)}
      </LSection>
      {visibleProducts.length === 0 && <LP className="py-20 text-center text-white/50">该分类暂时没有商品。</LP>}
    </LDiv>
  </LDiv>;
}
