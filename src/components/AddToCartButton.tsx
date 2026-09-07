"use client";

import { Check, ShoppingCart } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/data/products";

export default function AddToCartButton({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const add = () => {
    try {
      const current = JSON.parse(window.localStorage.getItem("one-g-cart") || "[]") as Array<Product & { quantity: number }>;
      const existing = current.find((item) => item.id === product.id);
      const next = existing ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, quantity: 1 }];
      window.localStorage.setItem("one-g-cart", JSON.stringify(next));
      setAdded(true);
    } catch { setAdded(false); }
  };
  return <button type="button" onClick={add} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black">{added ? <Check size={16} /> : <ShoppingCart size={16} />}{added ? "已加入购物车" : "立即购买"}</button>;
}
