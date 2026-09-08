"use client";

import { ShimmerButton } from "@/components/ui/shimmer-button";


import { Check, ShoppingCart } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/types/product";
import { addCartProduct } from "@/lib/cart";

export default function AddToCartButton({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const add = async () => {
    try {
      await addCartProduct(product.id);
      setAdded(true);
    } catch { setAdded(false); }
  };
  return <ShimmerButton type="button" disabled={product.status !== "active"} onClick={add}>{added ? <Check size={16} /> : <ShoppingCart size={16} />}{added ? "已加入购物车" : "加入购物车"}</ShimmerButton>;
}
