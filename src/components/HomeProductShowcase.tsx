import Link from "next/link";
import Image from "next/image";
import SupportButton from "./SupportButton";
import { Info } from "lucide-react";
import type { Product } from "@/types/product";
import { getOfferingNavigation } from "@/lib/offering-navigation";
import styles from "./HomeProductShowcase.module.css";

type Props = { product: Pick<Product, "id" | "name" | "subtitle" | "images" | "detail">; solutionHref?: string; heroImageIndex: number; eager?: boolean };

export default function HomeProductShowcase({ product, heroImageIndex, solutionHref, eager = false }: Props) {
  const note = product.detail!.imageNotes[heroImageIndex];
  const links = solutionHref ? null : getOfferingNavigation(product as Product);
  const titleId = `home-${product.id}-title`;
  return <section className={styles.product} aria-labelledby={titleId}>
    <div className={styles.copy}>
      <h1 id={titleId}>{product.name}</h1>
      <p>{product.subtitle}</p>
      <div className={styles.actions}>
        {solutionHref ? <><Link href={solutionHref}>了解方案</Link><SupportButton inline textOnly label="联系我们" entry="solutions"/></> : links && <><Link href={links.overviewHref}>了解产品</Link><Link href={links.purchaseHref}>购买</Link></>}
      </div>
    </div>
    <figure>
      <Image src={product.images[heroImageIndex]} alt={note.alt} width={note.width} height={note.height} sizes="(max-width: 767px) 90vw, 720px" loading={eager ? "eager" : "lazy"}/>
      <figcaption>{note.caption}</figcaption>
    </figure>
    <p className={styles.status}><Info size={14} aria-hidden="true"/><span>{solutionHref ? "机器人遥操作解决方案 · 三点与全身遥操均为已有技术，设备型号与部署条件待确认。" : product.detail!.statusNote}</span></p>
  </section>;
}
