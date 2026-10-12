"use client";

import { LDiv, LH1, LP } from "@/i18n/Elements";


import { LocalizedLink as Link } from "@/i18n/Elements";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import OrderSummary from "@/components/OrderSummary";
import { queryPaymentStatus, type Order } from "@/lib/commerce/service";

export default function OrderSuccessPage() {
  const { currentUser } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState("正在查询订单…");
  useEffect(() => {
    if (!currentUser) return;
    let active = true;
    const id = new URLSearchParams(window.location.search).get("order");
    void (id ? queryPaymentStatus(currentUser.id, id) : Promise.resolve(null)).then(result => {
      if (active) { setOrder(result); setMessage(result ? "" : "订单不存在、不可访问或订单服务尚未接入。"); }
    }).catch(() => { if (active) setMessage("暂时无法查询订单，请稍后重试。"); });
    return () => { active = false; };
  }, [currentUser]);
  return <LDiv className="mobile-page order-success min-h-screen w-full px-6 pb-24 pt-32"><LDiv className="mx-auto max-w-3xl"><LP className="eyebrow">ONE - G / ORDER</LP><LH1 className="mt-5 text-4xl font-bold">订单状态</LH1>
    <LP role="status" className="mt-6">{message}</LP>{order && <OrderSummary order={order}/>}
    <LDiv className="mt-10 flex gap-6"><Link intent="ordinary" href="/">返回首页</Link><Link intent="ordinary" href="/account">查看用户中心</Link></LDiv>
  </LDiv></LDiv>;
}
