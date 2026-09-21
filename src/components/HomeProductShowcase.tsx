import Link from "next/link";
import Image from "next/image";
import { Info } from "lucide-react";
import type { Product } from "@/types/product";
import { getOfferingNavigation } from "@/lib/offering-navigation";
import styles from "./HomeProductShowcase.module.css";

type Props = { product: Product; heroImageIndex: number; eager?: boolean };

export default function HomeProductShowcase({ product, heroImageIndex, eager = false }: Props) {
  const note = product.detail!.imageNotes[heroImageIndex];
  const links = getOfferingNavigation(product);
  const titleId = `home-${product.id}-title`;
  return <section className={styles.product} aria-labelledby={titleId}>
    <div className={styles.copy}>
      <h1 id={titleId}>{product.name}</h1>
      <p>{product.subtitle}</p>
      <div className={styles.actions}>
        <Link href={links.overviewHref}>了解产品</Link>
        <Link href={links.purchaseHref}>购买</Link>
      </div>
    </div>
    <figure>
      <Image src={product.images[heroImageIndex]} alt={note.alt} width={note.width} height={note.height} sizes="(max-width: 767px) 90vw, 720px" loading={eager ? "eager" : "lazy"}/>
      <figcaption>{note.caption}</figcaption>
    </figure>
    <p className={styles.status}><Info size={14} aria-hidden="true"/><span>{product.detail!.statusNote}</span></p>
  </section>;
}
