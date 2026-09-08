"use client";

import { ShimmerButton } from "@/components/ui/shimmer-button";


import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/pricing";
import { getConfigurationTotal, getOption } from "@/lib/configurator";
import { getCategoryName } from "@/lib/products";
import { readCart, writeCart, readSavedConfiguration, removeSavedConfiguration, getCartTotal } from "@/lib/cart";
import type { CartProduct } from "@/types/cart";
import type { RobotConfiguration } from "@/types/configuration";

type ConfigItem = { name: string; category: string; price?: number; quantity: number; config: RobotConfiguration };

export default function CartPage() {
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [config, setConfig] = useState<ConfigItem | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    Promise.all([readCart(), readSavedConfiguration()]).then(([items, saved]) => {
      if (!active) return;
      setProducts(items);
      if (saved) setConfig({ name: `${getOption(saved.baseRobotId)?.name ?? ""} 定制方案`, category: "在线定制", price: getConfigurationTotal(saved), quantity: 1, config: saved });
      setReady(true);
    });
    return () => { active = false; };
  }, []);
  const total = getCartTotal(products, config?.config ?? null);
  const removeProduct = (id: string) => { const next = products.filter(item => item.id !== id); writeCart(next); setProducts(next); };
  const updateQuantity = (id: string, quantity: number) => {
    if (!Number.isSafeInteger(quantity) || quantity < 1) return;
    const next = products.map(item => item.id === id ? { ...item, quantity } : item);
    writeCart(next); setProducts(next);
  };
  const removeConfig = () => { removeSavedConfiguration(); setConfig(null); };
  return <div className="min-h-screen w-full bg-black px-6 pb-24 pt-32 text-white sm:px-10"><div className="mx-auto max-w-5xl"><p className="eyebrow">ONE - G / CART</p><h1 className="mt-5 text-5xl font-bold tracking-[-0.06em] sm:text-7xl">购物车</h1>{!ready ? <p className="mt-16 text-white/45">正在读取方案...</p> : !products.length && !config ? <div className="mt-16 rounded-3xl border border-white/10 bg-[#0d0d0d] p-10 text-center"><p className="text-white/55">购物车还是空的</p><Link href="/products" className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-bold text-black">浏览商品</Link></div> : <div className="mt-12 space-y-3">{products.map((item) => <div key={item.id} className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-[#0d0d0d] p-5 sm:flex-row sm:items-center"><div className="flex-1"><p className="font-semibold">{item.name}</p><p className="mt-1 text-sm text-white/45">{getCategoryName(item.category)}</p></div><p className="text-sm text-white/70">{formatPrice(item.price)}</p><input aria-label={`${item.name} 数量`} type="number" min="1" value={item.quantity} onChange={(event) => updateQuantity(item.id, Number(event.target.value))} className="w-20 rounded-lg border border-white/15 bg-black px-3 py-2 text-center text-sm" /><button type="button" onClick={() => removeProduct(item.id)} aria-label={`删除 ${item.name}`} className="text-white/40 hover:text-white"><Trash2 size={18} /></button></div>)}{config && <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-[#111] p-5 sm:flex-row sm:items-center"><div className="flex-1"><p className="font-semibold">{config.name}</p><p className="mt-1 text-sm text-white/45">{config.category} · 数量 1</p></div><p className="text-sm text-white/70">{formatPrice(config.price)}</p><button type="button" onClick={removeConfig} aria-label="删除定制方案" className="text-white/40 hover:text-white"><Trash2 size={18} /></button></div>}<div className="flex items-end justify-between border-t border-white/15 pt-8"><div><p className="text-sm text-white/45">商品总价</p><p className="mt-2 text-3xl font-bold">{formatPrice(total)}</p></div><ShimmerButton href="/checkout" className="px-7">去结算</ShimmerButton></div></div>}</div></div>;
}
