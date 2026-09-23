"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { commerceService, orderStatusLabels, type Order } from "@/lib/commerce/service";
import { paymentLabel } from "@/lib/payments";
export default function AccountOrders({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    void commerceService.listOrders(userId).then(items => { if (active) setOrders(items); }).catch(() => { if (active) setError("暂时无法读取订单。"); });
    return () => { active = false; };
  }, [userId]);
  return <>{error ? <p role="alert">{error}</p> : !orders.length ? <p>暂无订单记录。</p> : orders.map(order => <p key={order.id} className="mb-3 break-all"><Link href={`/order-success?order=${encodeURIComponent(order.id)}`}>{order.demo ? "演示订单" : "订单"} {order.id} · {orderStatusLabels[order.status]} · {paymentLabel(order.payment)}</Link></p>)}</>;
}
