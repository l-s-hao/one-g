import { LDiv, LFigcaption, LFigure, LH1, LP, LSection, LSpan } from "@/i18n/Elements";
import { LocalizedLink as Link } from "@/i18n/Elements";
import { LocalizedImage as Image } from "@/i18n/Elements";
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
  return <LSection className={styles.product} aria-labelledby={titleId}>
    <LDiv className={styles.copy}>
      <LH1 id={titleId}>{product.name}</LH1>
      <LP>{product.subtitle}</LP>
      <LDiv className={styles.actions}>
        {solutionHref ? <><Link href={solutionHref}>了解方案</Link><SupportButton inline textOnly label="联系我们" entry="solutions"/></> : links && <><Link href={links.overviewHref}>了解产品</Link><Link href={links.purchaseHref}>购买</Link></>}
      </LDiv>
    </LDiv>
    <LFigure>
      <Image src={product.images[heroImageIndex]} alt={note.alt} width={note.width} height={note.height} sizes="(max-width: 767px) 90vw, 720px" loading={eager ? "eager" : "lazy"}/>
      <LFigcaption>{note.caption}</LFigcaption>
    </LFigure>
    <LP className={styles.status}><Info size={14} aria-hidden="true"/><LSpan>{solutionHref ? "机器人遥操作解决方案 · 三点与全身遥操均为已有技术，设备型号与部署条件待确认。" : product.detail!.statusNote}</LSpan></LP>
  </LSection>;
}
