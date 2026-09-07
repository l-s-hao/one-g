"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice, getConfigurationTotal, type ConfiguratorSelection } from "@/data/configurator";

export default function CheckoutPage() {
  const [total, setTotal] = useState(0);
  useEffect(() => { try { const config = JSON.parse(window.localStorage.getItem("one-g-config") || "null") as ConfiguratorSelection | null; const products = JSON.parse(window.localStorage.getItem("one-g-cart") || "[]") as Array<{ price: string; quantity: number }>; // eslint-disable-next-line react-hooks/set-state-in-effect
    setTotal((config ? getConfigurationTotal(config) : 0) + products.reduce((sum, item) => sum + Number(item.price.replace(/[^0-9]/g, "")) * item.quantity, 0)); } catch { // eslint-disable-next-line react-hooks/set-state-in-effect
    setTotal(0); } }, []);
  return <div className="min-h-screen w-full bg-black px-6 pb-24 pt-32 text-white sm:px-10"><div className="mx-auto max-w-4xl"><p className="eyebrow">ONE - G / CHECKOUT</p><h1 className="mt-5 text-5xl font-bold tracking-[-0.06em]">确认订单</h1><div className="mt-12 grid gap-5 lg:grid-cols-2"><section className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-7"><h2 className="text-xl font-bold">商品与定制配置</h2><p className="mt-5 text-sm leading-7 text-white/55">订单将包含购物车中的普通商品与 ONE - G 定制方案。</p><p className="mt-10 text-3xl font-bold">{formatPrice(total)}</p><p className="mt-2 text-xs text-white/35">演示价格，仅用于原型展示</p></section><section className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-7"><h2 className="text-xl font-bold">联系人信息</h2><div className="mt-6 space-y-4"><input placeholder="姓名" className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-white/50" /><input placeholder="联系电话" className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-white/50" /><textarea placeholder="收货地址" rows={4} className="w-full resize-none rounded-xl border border-white/15 bg-black px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-white/50" /></div><Link href="/order-success" className="mt-7 inline-flex rounded-full bg-white px-6 py-3 text-sm font-bold text-black">模拟提交订单</Link></section></div></div></div>;
}
