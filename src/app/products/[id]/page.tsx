import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import ProductVisual from "@/components/ProductVisual";
import AddToCartButton from "@/components/AddToCartButton";
import { getProductBySlug, getProducts, getCategoryName } from "@/lib/products";
import { formatPrice } from "@/lib/pricing";

export function generateStaticParams() { return getProducts().map((product) => ({ id: product.slug })); }

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProductBySlug(id);
  if (!product) notFound();
  return <div className="min-h-screen w-full bg-black px-6 pb-24 pt-28 text-white sm:px-10"><div className="mx-auto max-w-7xl"><Link href="/products" className="inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"><ArrowLeft size={16} /> 返回商品中心</Link><div className="mt-12 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20"><ProductVisual label={getCategoryName(product.category)} images={product.images} /><div><p className="eyebrow">{getCategoryName(product.category)}</p><h1 className="mt-5 text-5xl font-bold tracking-[-0.06em] sm:text-7xl">{product.name}</h1><p className="mt-6 text-xl text-white/75">{product.subtitle}</p><p className="mt-5 max-w-lg text-base leading-7 text-white/55">{product.description}</p><p className="mt-10 text-2xl font-semibold">{formatPrice(product.price)}</p><div className="mt-8 flex flex-wrap gap-3"><AddToCartButton product={product} /><Link href="/customize" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white">在线定制 <ArrowRight size={16} /></Link></div></div></div></div></div>;
}
