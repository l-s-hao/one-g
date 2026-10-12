"use client";

import CardHover from "@/components/CardHover";

import { LButton, LDiv, LH1, LInput, LP, LSpan } from "@/i18n/Elements";


import { useAuth } from "@/components/AuthProvider";
import { ShimmerButton } from "@/components/ui/shimmer-button";


import { LocalizedImage as Image } from "@/i18n/Elements";
import { LocalizedLink as Link } from "@/i18n/Elements";
import { Box, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/pricing";
import { getCategoryName } from "@/lib/products";
import { readCart, writeCart, readSavedConfiguration, removeSavedConfiguration, getCartTotal, readUnavailableCartItems, removeUnavailableCartItem } from "@/lib/cart";
import type { CartProduct } from "@/types/cart";
import type { ConfigurationSnapshot } from "@/types/configuration";

type ConfigItem = { name: string; category: string; price?: number; quantity: number; config: ConfigurationSnapshot };

export default function CartPage() {
  const { currentUser } = useAuth();
  const userId = currentUser?.id;
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [config, setConfig] = useState<ConfigItem | null>(null);
  const [unavailable, setUnavailable] = useState<Awaited<ReturnType<typeof readUnavailableCartItems>>>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!userId) return;
    let active = true;
    Promise.all([readCart(userId), readSavedConfiguration(userId), readUnavailableCartItems(userId)]).then(([items, saved, blocked]) => {
      if (!active) return;
      setProducts(items);
      setUnavailable(blocked);
      if (saved) setConfig({ name: saved.name, category: saved.category, price: saved.price, quantity: 1, config: saved });
      setReady(true);
    });
    return () => { active = false; };
  }, [userId]);
  const total = getCartTotal(products, config?.config ?? null);
  const removeProduct = (id: string) => { const next = products.filter(item => item.id !== id); if (!userId) return; writeCart(next, userId); setProducts(next); };
  const updateQuantity = (id: string, quantity: number) => {
    if (!Number.isSafeInteger(quantity) || quantity < 1) return;
    const next = products.map(item => item.id === id ? { ...item, quantity } : item);
    if (!userId) return; writeCart(next, userId); setProducts(next);
  };
  const removeConfig = () => { if (!userId) return; removeSavedConfiguration(userId); setConfig(null); };
  return <LDiv className="mobile-page cart-page min-h-screen w-full bg-black px-6 pb-24 pt-32 text-white sm:px-10"><LDiv className="mx-auto max-w-5xl"><LP className="eyebrow">ONE - G / CART</LP><LH1 className="mt-5 text-5xl font-bold tracking-[-0.06em] sm:text-7xl">购物车</LH1>{unavailable.map(item => <LDiv key={item.id} role="alert" className="mt-6 rounded-2xl border p-5"><LP>{item.reason}</LP><Link href="/solutions/teleoperation" className="underline">了解遥操作方案</Link><LButton type="button" className="ml-4 underline" onClick={() => { if (userId) { removeUnavailableCartItem(userId); setUnavailable([]); } }}>移除历史 SONIC Link 项目</LButton></LDiv>)}{!ready ? <LP className="mt-16 text-white/45">正在读取方案...</LP> : !products.length && !config ? <LDiv className="mt-16 rounded-3xl border border-white/10 bg-[#0d0d0d] p-10 text-center"><LP className="text-white/55">购物车还是空的</LP><LDiv className="mt-6 flex flex-wrap justify-center gap-[18px] md:flex-nowrap md:gap-7">
  <Link href="/" className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-white px-3 text-sm font-bold whitespace-nowrap text-black transition-colors duration-150 hover:bg-white/90 md:px-6">开始配置</Link>
  <Link href="/products" className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-white/35 bg-transparent px-3 text-sm font-bold whitespace-nowrap text-white transition-colors duration-150 hover:border-white/55 hover:bg-white/[0.06] md:px-6">浏览商品</Link>
</LDiv></LDiv> : <LDiv className="cart-items mt-12 space-y-3">{products.map((item) => <CardHover key={item.id}><LDiv data-card-hover-surface className="cart-row flex flex-col gap-5 rounded-2xl border border-white/10 bg-[#0d0d0d] p-5 sm:flex-row sm:items-center"><LSpan className="mobile-only cart-thumbnail relative">{item.images[0] ? <Image src={item.images[0]} alt="" fill sizes="64px" className="object-contain" /> : <Box size={24} aria-hidden="true" />}</LSpan><LDiv className="cart-copy flex-1"><LP className="font-semibold">{item.name}</LP><LP className="mt-1 text-sm text-white/45">{getCategoryName(item.category)}</LP></LDiv><LP className="text-sm text-white/70">{formatPrice(item.price)}</LP><LInput aria-label={`${item.name} 数量`} type="number" min="1" value={item.quantity} onChange={(event) => updateQuantity(item.id, Number(event.target.value))} className="w-20 rounded-lg border border-white/15 bg-black px-3 py-2 text-center text-sm" /><LButton type="button" onClick={() => removeProduct(item.id)} aria-label={`删除 ${item.name}`} className="text-white/40 hover:text-white"><Trash2 size={18} /></LButton></LDiv></CardHover>)}{config && <CardHover><LDiv data-card-hover-surface className="cart-row flex flex-col gap-5 rounded-2xl border border-white/10 bg-[#111] p-5 sm:flex-row sm:items-center"><LSpan className="mobile-only cart-thumbnail relative"><Box size={24} aria-hidden="true" /></LSpan><LDiv className="cart-copy flex-1"><LP className="font-semibold">{config.name}</LP><LP className="mt-1 text-sm text-white/45">{config.category} · 数量 1</LP></LDiv><LP className="text-sm text-white/70">{formatPrice(config.price)}</LP><LButton type="button" onClick={removeConfig} aria-label="删除配置方案" className="text-white/40 hover:text-white"><Trash2 size={18} /></LButton></LDiv></CardHover>}<LDiv className="cart-checkout mobile-checkout-bar flex items-end justify-between border-t border-white/15 pt-8"><LDiv><LP className="text-sm text-white/45">商品总价</LP><LP className="mt-2 text-3xl font-bold">{formatPrice(total)}</LP></LDiv>{unavailable.length ? <LButton type="button" disabled className="rounded-full border px-7 py-3 opacity-50">请先移除不可购买项目</LButton> : <ShimmerButton href="/checkout" className="px-7">去结算</ShimmerButton>}</LDiv></LDiv>}</LDiv></LDiv>;
}
