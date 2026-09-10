"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function OrderSuccessPage() {
  const [orderNumber, setOrderNumber] = useState("ONE-G-——");
  useEffect(() => { // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrderNumber(`ONE-G-${Date.now().toString().slice(-8)}`);
  }, []);
  return <div className="mobile-page order-success flex min-h-screen w-full items-center justify-center bg-black px-6 text-center text-white"><div><p className="eyebrow">ONE - G / ORDER</p><h1 className="mt-5 text-5xl font-bold tracking-[-0.06em] sm:text-7xl">订单提交成功</h1><p className="mt-8 text-white/55">模拟订单号：{orderNumber}</p><div className="mt-10 flex flex-wrap justify-center gap-3"><Link href="/" className="rounded-full bg-white px-6 py-3 text-sm font-bold text-black">返回首页</Link><Link href="/account" className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white">查看用户中心</Link></div></div></div>;
}
