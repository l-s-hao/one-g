import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOfferingPackages } from "@/lib/configurable-offerings";
import ProductPurchase from "@/components/ProductPurchase";

export function generateStaticParams() {
  return getOfferingPackages().map(({ product }) => ({ id: product.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const offering = getOfferingPackages().find(({ product }) => product.slug === id);
  return { title: offering ? `购买 ${offering.product.name} | ONE-G` : "ONE-G", alternates: { canonical: `https://l-s-hao.github.io/one-g/buy/${id}/` } };
}
export default async function BuyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offering = getOfferingPackages().find(({ product }) => product.slug === id);
  if (!offering) notFound();
  return <ProductPurchase key={offering.product.id} offering={offering}/>;
}
