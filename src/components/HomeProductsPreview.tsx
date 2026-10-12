import { getProductById } from "@/lib/products";
import { LocalizedLink as Link, LH2, LH3, LP, LSpan } from "@/i18n/Elements";
import { LayoutGrid, type LayoutGridCard } from "./ui/layout-grid";
import styles from "./HomePreviews.module.css";

// Editorial selection only; catalog order and canonical Product records stay intact.
const productIds = ["robotdock", "g1", "arm-a1", "vision-v1"] as const;
const prototypeNote = "商品资料用于原型展示；型号、参数与交付信息待确认。";

export default function HomeProductsPreview() {
  const cards: LayoutGridCard[] = productIds.map(id => {
    const product = getProductById(id)!;
    const note = product.detail?.imageNotes[0];
    const vision = id === "vision-v1";
    const caption = note?.caption ?? (vision
      ? "视觉硬件实拍 · 型号与商品对应关系待确认。"
      : product.showcase?.imageAlt ?? "现有机械臂渲染图 · 产品型号与交付信息待确认。");
    return {
      id: product.id,
      title: product.name,
      thumbnail: product.images[0] ?? "/one-g/products/home-collage/vision-device.jpg",
      imageAlt: note?.alt ?? product.showcase?.imageAlt ?? caption,
      width: note?.width ?? (vision ? 1280 : 3840),
      height: note?.height ?? (vision ? 1707 : id === "g1" ? 2159 : 2160),
      fit: "contain",
      wide: id === "robotdock" || vision,
      content: <>
        <LH3 id={`home-products-${id}-title`}>{product.name}</LH3>
        <LP className={styles.positioning}>{product.subtitle}</LP>
        <LP className={styles.note}>{product.detail?.statusNote ?? prototypeNote}</LP>
        <LP className={styles.caption}>{caption}</LP>
        <Link className={styles.action} href={`/products/${product.slug}`}>了解产品</Link>
      </>,
    };
  });
  return <section id="home-products" className={styles.section} aria-labelledby="home-products-title">
    <div className={styles.heading}><LH2 id="home-products-title">产品</LH2><Link href="/products">查看全部商品 <LSpan aria-hidden="true">→</LSpan></Link></div>
    <LayoutGrid namespace="home-products" cards={cards}/>
  </section>;
}
