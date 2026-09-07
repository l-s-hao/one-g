"use client";

import Link from "next/link";
import { useState } from "react";
import ProductVisual from "@/components/ProductVisual";
import { productCategories, products, type ProductCategory } from "@/data/products";

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState<(typeof productCategories)[number]>("全部");
  const visibleProducts = activeCategory === "全部" ? products : products.filter((product) => product.category === activeCategory as ProductCategory);
  return <div className="min-h-screen w-full bg-black px-6 pb-24 pt-32 text-white sm:px-10"><div className="mx-auto max-w-7xl"><p className="eyebrow">ONE - G / PRODUCTS</p><h1 className="mt-5 text-5xl font-bold tracking-[-0.06em] sm:text-7xl">商品中心</h1><p className="mt-5 text-lg text-white/55">探索 ONE-G 机器人与模块化硬件</p><div className="mt-12 flex flex-wrap gap-2 border-b border-white/10 pb-5" role="tablist" aria-label="商品分类">{productCategories.map((category) => <button key={category} type="button" role="tab" aria-selected={activeCategory === category} onClick={() => setActiveCategory(category)} className={`rounded-full border px-5 py-2.5 text-sm transition-colors ${activeCategory === category ? "border-white bg-white text-black" : "border-white/15 text-white/60 hover:border-white/50 hover:text-white"}`}>{category}</button>)}</div><div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{visibleProducts.map((product) => <Link key={product.id} href={`/products/${product.id}`} className="group rounded-3xl border border-white/10 bg-[#0d0d0d] p-3 transition-transform hover:-translate-y-1 hover:border-white/25"><ProductVisual label={product.category} compact /><div className="p-4"><div className="flex items-start justify-between gap-4"><h2 className="text-xl font-bold">{product.name}</h2>{product.featured && <span className="text-[10px] font-semibold tracking-[0.2em] text-white/40">FEATURED</span>}</div><p className="mt-2 text-sm text-white/55">{product.subtitle}</p><div className="mt-6 flex items-center justify-between"><span className="text-sm font-semibold text-white/75">{product.price}</span><span className="text-sm text-white/60 transition-colors group-hover:text-white">了解更多 →</span></div></div></Link>)}</div>{visibleProducts.length === 0 && <p className="py-20 text-center text-white/50">该分类暂时没有商品。</p>}</div></div>;
}
