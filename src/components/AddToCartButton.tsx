"use client";

import { ShimmerButton } from "@/components/ui/shimmer-button";


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
  return <ShimmerButton type="button" onClick={add}>{added ? <Check size={16} /> : <ShoppingCart size={16} />}{added ? "已加入购物车" : "加入购物车"}</ShimmerButton>;
}
