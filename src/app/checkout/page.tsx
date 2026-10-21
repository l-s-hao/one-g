"use client";

import { LButton, LDiv, LH1, LH2, LP, LSection } from "@/i18n/Elements";


import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import PaymentSelector from "@/components/PaymentSelector";
import { usePaymentPreference } from "@/components/usePaymentPreference";
import { formatPrice } from "@/lib/pricing";
import { readCart, readSavedConfiguration, getCartTotal, readUnavailableCartItems, unavailableSonicLinkMessage } from "@/lib/cart";
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
  const [blocked, setBlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const lock = useRef(false);
  const total = getCartTotal(items, configuration);
  useEffect(() => {
    if (!userId) return;
    let active = true;
    Promise.all([readCart(userId), readSavedConfiguration(userId), readUnavailableCartItems(userId)]).then(([items, saved, unavailable]) => { if (active) { setBlocked(unavailable.length > 0); setItems(items); setConfiguration(saved); setReady(true); } }).catch(() => { if (active) setMessage("无法读取当前用户购物车，请重新登录。"); });
    return () => { active = false; };
  }, [userId]);
  const create = async () => {
    if (blocked || lock.current || !userId || !payment || !ready || !!configuration || !items.length || total === undefined || !mockCommerceEnabled) return;
    lock.current = true; setPending(true); setMessage("");
    try {
      if ((await readUnavailableCartItems(userId)).length) { setBlocked(true); throw new Error(unavailableSonicLinkMessage); }
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
  return <LDiv className="mobile-page checkout-page min-h-screen w-full bg-black px-6 pb-24 pt-32 text-white sm:px-10"><LDiv className="mx-auto max-w-4xl">
    <LP className="eyebrow">ONE - G / CHECKOUT</LP><LH1 className="mt-5 text-5xl font-bold tracking-[-0.06em]">确认订单</LH1>
    <LP className="mt-5 text-sm">{mockCommerceEnabled ? "演示模式：仅创建本地演示待支付订单，不收款、不发货。" : "订单与支付服务尚未接入，暂不能创建真实订单。"}</LP>
    {blocked && <LP role="alert" className="mt-5">{unavailableSonicLinkMessage}</LP>}
    <LDiv className="checkout-sections mt-12 grid gap-5 lg:grid-cols-2">
      <LSection className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-7"><LH2 className="text-xl font-bold">商品与配置</LH2>
        {!items.length && <LP className="mt-5">{ready ? "购物车为空。" : "正在读取购物车…"}</LP>}
        {items.map(item => <LP key={item.id} className="mt-4">{item.name} × {item.quantity}</LP>)}
        {configuration && <LP className="mt-4">{configuration.name}：配置订单服务尚未接入，暂不能提交。请勿将此方案视为已下单。</LP>}
        <LP className="mt-10 text-3xl font-bold">{formatPrice(total)}</LP><LP className="mt-2 text-xs text-white/50">演示价格，仅用于原型展示；正式金额须由订单后端确认。</LP>
      </LSection>
      <LSection className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-7"><PaymentSelector value={payment} onChange={selectPayment} disabled={pending}/>
        <LH2 className="mt-8 text-xl font-bold">联系人信息</LH2><LP className="mt-3 text-sm text-white/55">正式订单服务未接入，演示不收集真实收货资料。</LP>
        <LDiv className="checkout-dock mobile-checkout-bar"><LButton effect="invert" effectSurface="card" intent="purchase" type="button" onClick={create} disabled={blocked || !mockCommerceEnabled || !ready || pending || !!configuration || !payment || !items.length || total === undefined} className="mt-7 rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50">{pending ? "正在创建…" : mockCommerceEnabled ? "创建演示待支付订单" : "订单服务尚未接入"}</LButton></LDiv>
        <LP role="alert" className="mt-4 text-sm">{message}</LP>
      </LSection>
    </LDiv>
  </LDiv></LDiv>;
}
