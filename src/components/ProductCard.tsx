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

export default function ProductCard({ product, hidden = false, flipId, actionVariant = "standard" }: { product: Product; hidden?: boolean; flipId?: string; actionVariant?: "standard" | "catalog" }) {
  const catalogActions = actionVariant === "catalog";
  const offering = isConfigurableOffering(product.id) ? getOfferingNavigation(product) : undefined;
  const detailHref = offering?.overviewHref ?? `/products/${product.slug}`;
  return <LArticle data-product-id={product.id} data-flip-id={flipId} data-filter-hidden={hidden || undefined} inert={hidden} aria-hidden={hidden || undefined} data-card-hover-host>
    <LDiv data-card-hover-surface data-card-depth className={`product-card ${styles.card}`}>
    <Link href={detailHref} aria-label={`了解更多：${product.name}`}>
      <ProductVisual label={product.detail?.imageNotes[0]?.alt ?? getCategoryName(product.category)} images={product.images} compact />
    </Link>
    <LDiv className={`product-card-copy ${styles.copy}`}>
      <LH2>{product.name}</LH2>
      <LP className={`product-subtitle ${styles.subtitle}`}>{product.subtitle}</LP>
      {product.status !== "active" && <LP className={styles.status}><ProductStatusBadge status={product.status} /></LP>}
      {product.detail?.imageNotes[0] && <LP className={styles.note}>{product.detail.imageNotes[0].caption}</LP>}
      {product.detail?.statusNote && <LP className={styles.note}>{product.detail.statusNote}</LP>}
      <LDiv className={`product-card-price ${styles.bottom}`}>
        <LP className="tabular-nums whitespace-nowrap">{formatPrice(product.price)}</LP>
        <LDiv className={`${styles.actions} ${catalogActions ? styles.catalogActions : ""}`} data-catalog-actions={catalogActions || undefined}>
          {/* 外层 Link 保持命中/焦点与业务语义；只有商品中心的内部完整表面承担新增位移。 */}
          <Link intent="ordinary" href={detailHref}>{catalogActions ? <LSpan className={styles.actionSurface}>了解更多 <LSpan aria-hidden="true" className={styles.actionArrow}>→</LSpan></LSpan> : <>了解更多 <LSpan aria-hidden="true">→</LSpan></>}</Link>
          {offering && <Link intent="purchase" href={offering.purchaseHref}>{catalogActions ? <LSpan className={styles.actionSurface}>{offering.purchaseLabel}</LSpan> : offering.purchaseLabel}</Link>}
        </LDiv>
      </LDiv>
    </LDiv>
    </LDiv>
  </LArticle>;
}
