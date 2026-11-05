import { getProductById } from "@/lib/products";
import { LocalizedLink as Link, LH2, LH3, LSpan } from "@/i18n/Elements";
import { LayoutGrid, type LayoutGridCard } from "./ui/layout-grid";
import styles from "./HomePreviews.module.css";

// Editorial selection only; catalog order and canonical Product records stay intact.
const productIds = ["robotdock", "g1", "arm-a1", "vision-v1"] as const;

export default function HomeProductsPreview() {
  const cards: LayoutGridCard[] = productIds.map(id => {
    const product = getProductById(id)!;
    const note = product.detail?.imageNotes[0];
    const vision = id === "vision-v1";
    const imageAltFallback = note?.caption ?? (vision
      ? "视觉硬件实拍 · 型号与商品对应关系待确认。"
      : product.showcase?.imageAlt ?? "现有机械臂渲染图 · 产品型号与交付信息待确认。");
    return {
      id: product.id,
      title: product.name,
      thumbnail: product.images[0] ?? "/one-g/products/home-collage/vision-device.jpg",
      imageAlt: note?.alt ?? product.showcase?.imageAlt ?? imageAltFallback,
      width: note?.width ?? (vision ? 1280 : 3840),
      height: note?.height ?? (vision ? 1707 : id === "g1" ? 2159 : 2160),
      fit: "contain",
      wide: id === "robotdock" || vision,
      content: <>
        <LH3 id={`home-products-${id}-title`}>{product.name}</LH3>
        <Link effect="invert" effectSurface="card" intent="ordinary" className={styles.action} href={`/products/${product.slug}`}>了解产品</Link>
      </>,
    };
  });
  return <section id="home-products" className={styles.section} aria-labelledby="home-products-title">
    <div className={styles.heading}><LH2 id="home-products-title">产品</LH2><Link intent="ordinary" href="/products">查看全部商品 <LSpan aria-hidden="true">→</LSpan></Link></div>
    <LayoutGrid namespace="home-products" cards={cards}/>
  </section>;
}
