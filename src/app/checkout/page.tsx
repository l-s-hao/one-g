"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import PaymentSelector from "@/components/PaymentSelector";
import { usePaymentPreference } from "@/components/usePaymentPreference";
import { formatPrice } from "@/lib/pricing";
import { readCart, readSavedConfiguration, getCartTotal } from "@/lib/cart";
import type { ConfigurationSnapshot } from "@/types/configuration";
import type { CartProduct } from "@/types/cart";
import { commerceService } from "@/lib/commerce/service";
import { mockCommerceEnabled } from "@/lib/demo-mode";

export default function CheckoutPage() {
  const { currentUser } = useAuth();
  const userId = currentUser?.id;
  const router = useRouter();
  const { payment, selectPayment } = usePaymentPreference();
  const [items, setItems] = useState<CartProduct[]>([]);
  const [configuration, setConfiguration] = useState<ConfigurationSnapshot | null>(null);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const lock = useRef(false);
  const total = getCartTotal(items, configuration);
  useEffect(() => {
    if (!userId) return;
    let active = true;
    Promise.all([readCart(userId), readSavedConfiguration(userId)]).then(([items, saved]) => { if (active) { setItems(items); setConfiguration(saved); setReady(true); } }).catch(() => { if (active) setMessage("无法读取当前用户购物车，请重新登录。"); });
    return () => { active = false; };
  }, [userId]);
  const create = async () => {
    if (lock.current || !userId || !payment || !ready || !!configuration || !items.length || total === undefined || !mockCommerceEnabled) return;
    lock.current = true; setPending(true); setMessage("");
    try {
      const lines = items.map(item => ({ productId: item.id, quantity: item.quantity }));
      // Stable across retries and refreshes for the same checkout. No amount is sent.
      const fingerprint = JSON.stringify({ lines, payment });
      const storageKey = `one-g-checkout:${userId}`;
      let previous: { fingerprint?: string; key?: string } | null = null;
      try { previous = JSON.parse(sessionStorage.getItem(storageKey) ?? "null"); } catch { /* Start a new demo checkout if unavailable. */ }
      const key = previous?.fingerprint === fingerprint && typeof previous.key === "string" ? previous.key : crypto.randomUUID();
      sessionStorage.setItem(storageKey, JSON.stringify({ fingerprint, key }));
      const order = await commerceService.createOrder(userId, { items: lines, payment, idempotencyKey: key });
      router.push(`/order-success?order=${encodeURIComponent(order.id)}`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "订单创建失败，请重试。"); lock.current = false; setPending(false); }
  };
  return <div className="mobile-page checkout-page min-h-screen w-full bg-black px-6 pb-24 pt-32 text-white sm:px-10"><div className="mx-auto max-w-4xl">
    <p className="eyebrow">ONE - G / CHECKOUT</p><h1 className="mt-5 text-5xl font-bold tracking-[-0.06em]">确认订单</h1>
    <p className="mt-5 text-sm">{mockCommerceEnabled ? "演示模式：仅创建本地演示待支付订单，不收款、不发货。" : "订单与支付服务尚未接入，暂不能创建真实订单。"}</p>
    <div className="checkout-sections mt-12 grid gap-5 lg:grid-cols-2">
      <section className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-7"><h2 className="text-xl font-bold">商品与配置</h2>
        {!items.length && <p className="mt-5">{ready ? "购物车为空。" : "正在读取购物车…"}</p>}
        {items.map(item => <p key={item.id} className="mt-4">{item.name} × {item.quantity}</p>)}
        {configuration && <p className="mt-4">{configuration.name}：配置订单服务尚未接入，暂不能提交。请勿将此方案视为已下单。</p>}
        <p className="mt-10 text-3xl font-bold">{formatPrice(total)}</p><p className="mt-2 text-xs text-white/50">演示价格，仅用于原型展示；正式金额须由订单后端确认。</p>
      </section>
      <section className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-7"><PaymentSelector value={payment} onChange={selectPayment} disabled={pending}/>
        <h2 className="mt-8 text-xl font-bold">联系人信息</h2><p className="mt-3 text-sm text-white/55">正式订单服务未接入，演示不收集真实收货资料。</p>
        <div className="checkout-dock mobile-checkout-bar"><button type="button" onClick={create} disabled={!mockCommerceEnabled || !ready || pending || !!configuration || !payment || !items.length || total === undefined} className="mt-7 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black disabled:opacity-50">{pending ? "正在创建…" : mockCommerceEnabled ? "创建演示待支付订单" : "订单服务尚未接入"}</button></div>
        <p role="alert" className="mt-4 text-sm">{message}</p>
      </section>
    </div>
  </div></div>;
}
