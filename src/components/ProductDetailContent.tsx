import ProductStatusBadge from "./ProductStatusBadge";
import { getProductActions } from "@/lib/product-actions";
import SupportButton from "./SupportButton";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getProductStatusLabel } from "@/lib/products";
import type { Product } from "@/types/product";
import styles from "./ProductDetailContent.module.css";

export default function ProductDetailContent({ product }: { product: Product }) {
  const detail = product.detail;
  const actions = getProductActions(product);
  if (!detail) return null;
  return <article className={styles.page}>
    <div className={styles.container}>
      <Link href="/products" className={styles.back}><ArrowLeft size={16} /> 返回商品中心</Link>
      <section className={styles.hero} aria-labelledby="product-title">
        <div>
          <p className={styles.eyebrow}><ProductStatusBadge status={product.status} /></p>
          <h1 id="product-title">{product.name}</h1>
          <p className={styles.subtitle}>{product.subtitle}</p>
          <p>{product.description}</p>
          <p className={styles.notice}>{detail.statusNote}</p>
          <div className={styles.actions}>{actions.configurePath && <Link href={actions.configurePath}>{actions.configurationLabel}</Link>}<Link href="/configure">查看套餐 →</Link><a href="#specifications">了解规格 ↓</a></div>
        </div>
        <figure className={styles.image}>
          <Image src={product.images[0]} alt={detail.imageNotes[0].alt} width={detail.imageNotes[0].width} height={detail.imageNotes[0].height} sizes="(max-width: 767px) 100vw, 50vw" preload />
          <figcaption>{detail.imageNotes[0].caption}</figcaption>
        </figure>
      </section>
      {detail.sections ? detail.sections.filter(section => section.id !== "modes").map(section => <section id={section.id} key={section.id} className={styles.section} aria-labelledby={`${section.id}-title`}>
        <p className={styles.eyebrow}>{section.eyebrow}</p><h2 id={`${section.id}-title`}>{section.title}</h2>
        {section.paragraphs?.map(text => <p key={text}>{text}</p>)}
        {section.cards && <div className={styles.bundles}>{section.cards.map(card => <div className={styles.card} key={card.title}><h3>{card.title}</h3><p>{card.description}</p>{card.items && <ul>{card.items.map(item => <li key={item}>{item}</li>)}</ul>}</div>)}</div>}
        {section.media && <div className={styles.media}>{section.media.map(media => <figure className={styles.image} key={media.src}><Image src={media.src} alt={media.alt} width={media.width} height={media.height} sizes="(max-width: 767px) 100vw, 80vw" /><figcaption>{media.caption}</figcaption></figure>)}</div>}
        {section.link && <div className={styles.actions}><Link href={section.link.href}>{section.link.label}</Link></div>}
      </section>) : <>
      <section className={styles.section} aria-labelledby="value-title">
        <p className={styles.eyebrow}>01 / DESIGN GOALS</p><h2 id="value-title">供电、通信、驱动，一体接入。</h2>
        <div className={styles.grid}>{detail.highlights?.map(item => <div className={styles.card} key={item.title}><h3>{item.title}</h3><p>{item.description}</p></div>)}</div>
      </section>
      <section className={styles.section} aria-labelledby="interface-title">
        <p className={styles.eyebrow}>02 / INTERFACE</p><h2 id="interface-title">接口架构 · 规划方案</h2><p>{detail.interfaceNote}</p>
        <ul className={styles.interfaces}>{detail.interfaces?.map(name => <li key={name}>{name}<span>拟定接口</span></li>)}</ul>
      </section>
      <section className={styles.section} aria-labelledby="compatibility-title">
        <p className={styles.eyebrow}>03 / COMPATIBILITY</p><h2 id="compatibility-title">兼容设备 · 分阶段适配</h2>
        <div className={styles.compatibility}>
          <div>{detail.compatibility?.map(device => <div className={styles.device} key={device.name}><h3>{device.name}</h3><span className={styles.badge}>{device.status}</span><p>{device.description}</p></div>)}<p>{detail.compatibilityNote}</p></div>
          {product.images[1] && detail.imageNotes[1] && <figure className={styles.sketch}><Image src={product.images[1]} alt={detail.imageNotes[1].alt} width={detail.imageNotes[1].width} height={detail.imageNotes[1].height} sizes="(max-width: 767px) 100vw, 33vw" /><figcaption>{detail.imageNotes[1].caption}</figcaption></figure>}
        </div>
      </section>
      </>}
      <section id="specifications" className={styles.section} aria-labelledby="specifications-title">
        <p className={styles.eyebrow}>SPECIFICATIONS</p><h2 id="specifications-title">技术规格 · 待验证与确认</h2>
        <dl className={styles.specs}>{product.specifications?.map(spec => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}{spec.note && <small>{spec.note}</small>}</dd></div>)}</dl>
      </section>
      <section className={styles.section} aria-labelledby="status-title">
        <p className={styles.eyebrow}>PRODUCT STATUS</p><h2 id="status-title">{getProductStatusLabel(product.status)}，{product.price === undefined ? "价格待定" : "获取报价"}。</h2><p>{detail.statusNote}</p><p>如需了解方案，请通过页面的「咨询客服」联系。</p>
      </section>
    </div>
    <SupportButton />
  </article>;
}
