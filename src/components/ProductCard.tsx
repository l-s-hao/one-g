import ProductStatusBadge from "./ProductStatusBadge";
import Link from "next/link";
import ProductVisual from "./ProductVisual";
import { getCategoryName } from "@/lib/products";
import { formatPrice } from "@/lib/pricing";
import type { Product } from "@/types/product";

export default function ProductCard({ product }: { product: Product }) {
  return <Link href={`/products/${product.slug}`} className="product-card group rounded-3xl border border-white/10 bg-[#0d0d0d] p-3 transition-transform hover:-translate-y-1 hover:border-white/25"><ProductVisual label={product.detail?.imageNotes[0]?.alt ?? getCategoryName(product.category)} images={product.images} compact /><div className="product-card-copy p-4">{product.status !== "active" && <p className="mb-3 text-sm font-semibold"><ProductStatusBadge status={product.status} /></p>}{product.detail?.imageNotes[0] && <p className="mb-3 text-xs text-white/55">{product.detail.imageNotes[0].caption}</p>}<div className="flex items-start justify-between gap-4"><h2 className="text-xl font-bold">{product.name}</h2>{product.featured && <span className="text-[10px] font-semibold tracking-[0.2em] text-white/40">FEATURED</span>}</div><p className="product-subtitle mt-2 text-sm text-white/55">{product.subtitle}</p><div className="product-card-price mt-6 flex items-center justify-between"><span className="text-sm font-semibold text-white/75">{formatPrice(product.price)}</span><span className="text-sm text-white/60 transition-colors group-hover:text-white">{product.status !== "active" ? "了解产品 →" : "了解更多 →"}</span></div></div></Link>;
}
