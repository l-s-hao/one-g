import ProductStatusBadge from "./ProductStatusBadge";
import Link from "next/link";
import ProductVisual from "./ProductVisual";
import { getCategoryName } from "@/lib/products";
import { formatPrice } from "@/lib/pricing";
import { isConfigurableOffering } from "@/data/configurable-offerings";
import { getOfferingNavigation } from "@/lib/offering-navigation";
import type { Product } from "@/types/product";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product, hidden = false, flipId }: { product: Product; hidden?: boolean; flipId?: string }) {
  const offering = isConfigurableOffering(product.id) ? getOfferingNavigation(product) : undefined;
  const detailHref = offering?.overviewHref ?? `/products/${product.slug}`;
  return <article data-product-id={product.id} data-flip-id={flipId} data-filter-hidden={hidden || undefined} inert={hidden} aria-hidden={hidden || undefined} className={`product-card ${styles.card}`}>
    <Link href={detailHref} aria-label={`了解更多：${product.name}`}>
      <ProductVisual label={product.detail?.imageNotes[0]?.alt ?? getCategoryName(product.category)} images={product.images} compact />
    </Link>
    <div className={`product-card-copy ${styles.copy}`}>
      {product.status !== "active" && <p className={styles.status}><ProductStatusBadge status={product.status} /></p>}
      {product.detail?.imageNotes[0] && <p className={styles.note}>{product.detail.imageNotes[0].caption}</p>}
      <h2>{product.name}</h2>
      <p className={`product-subtitle ${styles.subtitle}`}>{product.subtitle}</p>
      {product.detail?.statusNote && <p className={styles.note}>{product.detail.statusNote}</p>}
      <div className={`product-card-price ${styles.bottom}`}>
        <p>{formatPrice(product.price)}</p>
        <div className={styles.actions}>
          <Link href={detailHref}>了解更多 <span aria-hidden="true">→</span></Link>
          {offering && <Link href={offering.purchaseHref}>{offering.purchaseLabel}</Link>}
        </div>
      </div>
    </div>
  </article>;
}
