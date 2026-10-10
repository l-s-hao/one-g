import { LSpan } from "@/i18n/Elements";
import type { CatalogStatus } from "@/types/product";
import { getProductStatusLabel } from "@/lib/product-policy";

export default function ProductStatusBadge({ status, className }: { status: CatalogStatus; className?: string }) {
  return <LSpan className={className} data-product-status={status}>{getProductStatusLabel(status)}</LSpan>;
}
