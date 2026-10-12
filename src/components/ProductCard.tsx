import { LArticle, LDiv, LH2, LP, LSpan } from "@/i18n/Elements";
import ProductStatusBadge from "./ProductStatusBadge";
import { LocalizedLink as Link } from "@/i18n/Elements";
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
  return <LArticle data-product-id={product.id} data-flip-id={flipId} data-filter-hidden={hidden || undefined} inert={hidden} aria-hidden={hidden || undefined} data-card-hover-host>
    <LDiv data-card-hover-surface className={`product-card ${styles.card}`}>
    <Link href={detailHref} aria-label={`了解更多：${product.name}`}>
      <ProductVisual label={product.detail?.imageNotes[0]?.alt ?? getCategoryName(product.category)} images={product.images} compact />
    </Link>
    <LDiv className={`product-card-copy ${styles.copy}`}>
      {product.status !== "active" && <LP className={styles.status}><ProductStatusBadge status={product.status} /></LP>}
      {product.detail?.imageNotes[0] && <LP className={styles.note}>{product.detail.imageNotes[0].caption}</LP>}
      <LH2>{product.name}</LH2>
      <LP className={`product-subtitle ${styles.subtitle}`}>{product.subtitle}</LP>
      {product.detail?.statusNote && <LP className={styles.note}>{product.detail.statusNote}</LP>}
      <LDiv className={`product-card-price ${styles.bottom}`}>
        <LP>{formatPrice(product.price)}</LP>
        <LDiv className={styles.actions}>
          <Link href={detailHref}>了解更多 <LSpan aria-hidden="true">→</LSpan></Link>
          {offering && <Link href={offering.purchaseHref}>{offering.purchaseLabel}</Link>}
        </LDiv>
      </LDiv>
    </LDiv>
    </LDiv>
  </LArticle>;
}
