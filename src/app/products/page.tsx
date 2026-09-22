"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { isConfigurableOffering } from "@/data/configurable-offerings";
import ProductCard from "@/components/ProductCard";
import ProductStatusBadge from "@/components/ProductStatusBadge";
import { getConfigurableOfferings } from "@/lib/configurable-offerings";
import { getOfferingNavigation } from "@/lib/offering-navigation";
import { getCategories, getProducts, getProductsByCategory } from "@/lib/products";
import type { ProductCategory } from "@/types/product";
import styles from "./products.module.css";

const filterCategories = getCategories().filter(category => category.id !== "accessory");
const productCategories = [{ id: "all", name: "全部" }, ...filterCategories];
const coreOfferings = getConfigurableOfferings();

export default function ProductsPage() {
  return <Suspense fallback={<p className="p-10 text-white/50">正在加载商品…</p>}><ProductsByQuery /></Suspense>;
}

function ProductsByQuery() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = searchParams.get("category");
  const category = filterCategories.find(category => category.id === query)?.id ?? "all";
  const selectCategory = (nextCategory: ProductCategory | "all") => {
    if (nextCategory === category) return;
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
  const visibleProducts = (activeCategory === "all" ? getProducts() : getProductsByCategory(activeCategory)).filter(product => !isConfigurableOffering(product.id));
  return <div className="mobile-page products-page min-h-screen w-full bg-black px-6 pb-24 pt-32 text-white sm:px-10">
    <div className="mx-auto max-w-7xl">
      <p className="eyebrow">ONE - G / PRODUCTS</p>
      <h1 className="mt-5 text-5xl font-bold tracking-[-0.06em] sm:text-7xl">商品中心</h1>
      <p className="mt-5 text-lg text-white/55">探索 ONE-G 机器人与模块化硬件</p>

      <section className={styles.coreSection} aria-labelledby="core-products-title">
        <h2 id="core-products-title" className={styles.sectionTitle}>主产品</h2>
        <div className={styles.coreGrid}>
          {coreOfferings.map(({ product, detail, heroImageIndex }) => {
            const links = getOfferingNavigation(product);
            const image = detail.imageNotes[heroImageIndex];
            return <article key={product.id} className={styles.coreCard} aria-labelledby={`core-${product.id}-title`}>
              <figure className={styles.figure}>
                <div className={styles.image}>
                  <Image src={product.images[heroImageIndex]} alt={image.alt} fill sizes="(max-width: 767px) calc(100vw - 56px), (max-width: 1359px) 46vw, 620px" />
                </div>
                <figcaption>{image.caption}</figcaption>
              </figure>
              <div className={styles.coreCopy}>
                <h3 id={`core-${product.id}-title`}>{product.name}</h3>
                <p className={styles.subtitle}>{product.subtitle}</p>
                <ProductStatusBadge status={product.status} className={styles.statusBadge} />
                <p className={styles.statusNote}>{detail.statusNote}</p>
                <div className={styles.actions}>
                  <Link href={links.overviewHref}>了解产品</Link>
                  <Link href={links.purchaseHref}>{links.purchaseLabel}</Link>
                </div>
              </div>
            </article>;
          })}
        </div>
      </section>

      <section className={styles.standardSection} aria-labelledby="standard-products-title">
        <h2 id="standard-products-title" className={styles.sectionTitle}>标准商品</h2>
        <div className="product-categories mt-12 flex flex-wrap gap-2 border-b border-white/10 pb-5" role="tablist" aria-label="标准商品分类">
          {productCategories.map((category) => <button key={category.id} type="button" role="tab" aria-selected={activeCategory === category.id} onClick={() => onCategoryChange(category.id as ProductCategory | "all")} className={`rounded-full border px-5 py-2.5 text-sm transition-colors ${activeCategory === category.id ? "border-white bg-white text-black" : "border-white/15 text-white/60 hover:border-white/50 hover:text-white"}`}>{category.name}</button>)}
        </div>
        <div className="product-grid mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
        {visibleProducts.length === 0 && <p className="py-20 text-center text-white/50">该分类暂时没有商品。</p>}
      </section>
    </div>
  </div>;
}
