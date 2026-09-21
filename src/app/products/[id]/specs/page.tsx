import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailContent from "@/components/ProductDetailContent";
import { getConfigurableOfferings } from "@/lib/configurable-offerings";
import { getProductBySlug } from "@/lib/products";
import { isConfigurableOffering } from "@/data/configurable-offerings";
import { getOfferingNavigation } from "@/lib/offering-navigation";

export function generateStaticParams() {
  return getConfigurableOfferings().map(({ product }) => ({ id: product.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const product = getProductBySlug((await params).id);
  if (!product || !isConfigurableOffering(product.id)) return {};
  return { title: `${product.name} 技术规格 — ONE-G`, description: product.detail?.statusNote,
    alternates: { canonical: `https://l-s-hao.github.io/one-g${getOfferingNavigation(product).specsHref}/` } };
}
export default async function SpecificationsPage({ params }: { params: Promise<{ id: string }> }) {
  const product = getProductBySlug((await params).id);
  if (!product || !isConfigurableOffering(product.id)) notFound();
  return <ProductDetailContent product={product} view="specs"/>;
}
