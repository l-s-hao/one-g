"use client";

import Link from "next/link";
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
  return <div className="mobile-page order-success min-h-screen w-full px-6 pb-24 pt-32"><div className="mx-auto max-w-3xl"><p className="eyebrow">ONE - G / ORDER</p><h1 className="mt-5 text-4xl font-bold">订单状态</h1>
    <p role="status" className="mt-6">{message}</p>{order && <OrderSummary order={order}/>}
    <div className="mt-10 flex gap-6"><Link href="/">返回首页</Link><Link href="/account">查看用户中心</Link></div>
  </div></div>;
}
