import type { CatalogStatus } from "@/types/product";
import { getProductStatusLabel } from "@/lib/product-policy";

export default function ProductStatusBadge({ status, className }: { status: CatalogStatus; className?: string }) {
  return <span className={className} data-product-status={status}>{getProductStatusLabel(status)}</span>;
}
