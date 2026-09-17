"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { isConfigurableOffering } from "@/data/configurable-offerings";
import ProductCard from "@/components/ProductCard";
import { getCategories, getProducts, getProductsByCategory } from "@/lib/products";
import type { ProductCategory } from "@/types/product";

const filterCategories = getCategories().filter(category => category.id !== "accessory");
const productCategories = [{ id: "all", name: "全部" }, ...filterCategories];

export default function ProductsPage() {
  return <Suspense fallback={<p className="p-10 text-white/50">正在加载商品…</p>}><ProductsByQuery /></Suspense>;
}

function ProductsByQuery() {
  const query = useSearchParams().get("category");
  const category = filterCategories.find(category => category.id === query)?.id ?? "all";
  return <ProductCatalog key={category} initialCategory={category} />;
}

function ProductCatalog({ initialCategory }: { initialCategory: ProductCategory | "all" }) {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "all">(initialCategory);
  const visibleProducts = (activeCategory === "all" ? getProducts() : getProductsByCategory(activeCategory)).filter(product => !isConfigurableOffering(product.id));
  return <div className="mobile-page products-page min-h-screen w-full bg-black px-6 pb-24 pt-32 text-white sm:px-10"><div className="mx-auto max-w-7xl"><p className="eyebrow">ONE - G / PRODUCTS</p><h1 className="mt-5 text-5xl font-bold tracking-[-0.06em] sm:text-7xl">商品中心</h1><p className="mt-5 text-lg text-white/55">探索 ONE-G 机器人与模块化硬件</p><div className="product-categories mt-12 flex flex-wrap gap-2 border-b border-white/10 pb-5" role="tablist" aria-label="商品分类">{productCategories.map((category) => <button key={category.id} type="button" role="tab" aria-selected={activeCategory === category.id} onClick={() => setActiveCategory(category.id as ProductCategory | "all")} className={`rounded-full border px-5 py-2.5 text-sm transition-colors ${activeCategory === category.id ? "border-white bg-white text-black" : "border-white/15 text-white/60 hover:border-white/50 hover:text-white"}`}>{category.name}</button>)}</div><div className="product-grid mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>{visibleProducts.length === 0 && <p className="py-20 text-center text-white/50">该分类暂时没有商品。</p>}</div></div>;
}
