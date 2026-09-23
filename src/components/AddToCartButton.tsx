"use client";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Check, ShoppingCart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Product } from "@/types/product";
import { getProductPolicy } from "@/lib/product-policy";
import { addCartProduct } from "@/lib/cart";
import { loginDestination } from "@/lib/auth-routing";
import { rememberCartIntent, consumeCartIntent } from "@/lib/pending-cart-action";
import { useAuth } from "./AuthProvider";

export default function AddToCartButton({ product }: { product: Product }) {
  const { currentUser, authReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname().replace(/\/+$/, "") || "/";
  const [added, setAdded] = useState(false);
  const [notice, setNotice] = useState("");
  const busy = useRef(false);
  useEffect(() => {
    if (!authReady || currentUser?.role !== "USER") return;
    let active = true;
    void Promise.resolve().then(() => { if (active && consumeCartIntent(product.id, pathname)) setNotice("登录成功，请继续加入购物车。"); });
    return () => { active = false; };
  }, [authReady, currentUser, product.id, pathname]);
  const add = async () => {
    if (!authReady || busy.current) return;
    if (!currentUser || currentUser.role !== "USER") {
      rememberCartIntent(product.id, pathname);
      const target = pathname + window.location.search + window.location.hash;
      router.push(loginDestination(target) + (currentUser ? "&mode=switch" : ""));
      return;
    }
    busy.current = true;
    try { await addCartProduct(product.id, currentUser.id); setAdded(true); setNotice(""); }
    catch { setAdded(false); setNotice("加入失败，请重试。"); }
    finally { busy.current = false; }
  };
  if (!getProductPolicy(product).canAddToCart) return null;
  return <div><ShimmerButton type="button" disabled={!authReady} onClick={add}>{added ? <Check size={16} /> : <ShoppingCart size={16} />}{added ? "已加入购物车" : "加入购物车"}</ShimmerButton>{notice && <p role="status" className="mt-3 text-sm">{notice}</p>}</div>;
}
