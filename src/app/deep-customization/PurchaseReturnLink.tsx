"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { isPaymentMethod } from "@/lib/payments";

type Destination = { product: string; href: string; packages: string[] };

export default function PurchaseReturnLink({ destinations }: { destinations: Destination[] }) {
  const params = useSearchParams();
  // Resolve only known products; never accept a caller-provided return URL.
  const destination = destinations.find(item => item.product === params.get("product"));
  const packageId = params.get("package");
  const payment = params.get("payment");
  const quantity = Number(params.get("quantity"));
  const href = destination ? {
    pathname: destination.href,
    query: {
      ...(packageId && destination.packages.includes(packageId) ? { package: packageId } : {}),
      ...(isPaymentMethod(payment) ? { payment } : {}),
      ...(Number.isSafeInteger(quantity) && quantity > 0 && quantity <= 999 ? { quantity: String(quantity) } : {}),
    },
  } : "/products";

  return <Link href={href}>← 返回购买</Link>;
}
