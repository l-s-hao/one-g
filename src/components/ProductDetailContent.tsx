import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";
import { solutions } from "@/data/solutions";
import { getOfferingNavigation, getOfferingSpecificationGroups } from "@/lib/offering-navigation";
import ProductStatusBadge from "./ProductStatusBadge";
import ProductLocalNav from "./ProductLocalNav";
import styles from "./ProductDetailContent.module.css";

export default function ProductDetailContent({ product, view = "overview" }: { product: Product; view?: "overview" | "specs" }) {
  const detail = product.detail;
  if (!detail) return null;
  const links = getOfferingNavigation(product);
  const purchase = <Link href={links.purchaseHref}>{links.purchaseLabel}</Link>;
  const tasks = solutions.filter(item => item.productIds.includes(product.id));
  return <article data-product-page className={styles.page} id="product-top">
    <ProductLocalNav key={`${product.id}-${view}`} name={product.name} links={links} view={view}/>
    <div className={styles.container}>
      {view === "overview" ? <>
        <section className={styles.hero} id="product-hero" aria-labelledby="product-title">
          <p className={styles.eyebrow}><ProductStatusBadge status={product.status}/></p>
          <h1 id="product-title">{product.name}</h1><p className={styles.subtitle}>{product.subtitle}</p>
          <div className={styles.actions}>{purchase}<Link href={links.specsHref}>技术规格</Link></div>
          <figure className={styles.mainImage}><Image src={product.images[0]} alt={detail.imageNotes[0].alt} width={detail.imageNotes[0].width} height={detail.imageNotes[0].height} sizes="(max-width:767px) 90vw, 800px" loading="eager"/><figcaption>{detail.imageNotes[0].caption}</figcaption></figure>
          <p className={styles.heroNotice}>{detail.statusNote}</p>
        </section>
        <div className={styles.marker} id="product-hero-end" aria-hidden="true"/>
        <section className={styles.section} aria-labelledby="product-overview-title"><p className={styles.eyebrow}>PRODUCT OVERVIEW</p><h2 id="product-overview-title">了解 {product.name}</h2><p>{product.description}</p>
          {detail.highlights && <div className={styles.grid}>{detail.highlights.map(item => <div className={styles.card} key={item.title}><h3>{item.title}</h3><p>{item.description}</p></div>)}</div>}
        </section>
        {detail.sections ? detail.sections.filter(section => section.id !== "modes").map(section => <section id={section.id} key={section.id} className={styles.section} aria-labelledby={`${section.id}-title`}>
          <p className={styles.eyebrow}>{section.eyebrow}</p><h2 id={`${section.id}-title`}>{section.title}</h2>
          {section.paragraphs?.map(text => <p key={text}>{text}</p>)}
          {section.cards && <div className={styles.grid}>{section.cards.map(card => <div className={styles.card} key={card.title}><h3>{card.title}</h3><p>{card.description}</p>{card.items && <ul>{card.items.map(item => <li key={item}>{item}</li>)}</ul>}</div>)}</div>}
          {section.media && <div className={styles.media}>{section.media.map(media => <figure key={media.src}><Image src={media.src} alt={media.alt} width={media.width} height={media.height} sizes="(max-width:767px) 100vw, 80vw"/><figcaption>{media.caption}</figcaption></figure>)}</div>}
          {section.link && <div className={styles.actions}><Link href={section.link.href}>{section.link.label}</Link></div>}
        </section>) : <>
          <section className={styles.section} aria-labelledby="interface-title"><p className={styles.eyebrow}>INTERFACE</p><h2 id="interface-title">接口与集成 · 规划方案</h2><p>{detail.interfaces?.join(" · ")}</p><p>{detail.interfaceNote}</p></section>
          <section className={styles.section} aria-labelledby="compatibility-title"><p className={styles.eyebrow}>COMPATIBILITY</p><h2 id="compatibility-title">兼容设备 · 分阶段适配</h2>
            <div className={styles.compatibility}><div>{detail.compatibility?.map(device => <div className={styles.device} key={device.name}><h3>{device.name}</h3><span>{device.status}</span><p>{device.description}</p></div>)}<p>{detail.compatibilityNote}</p></div>
              {product.images[1] && detail.imageNotes[1] && <figure className={styles.sketch}><Image src={product.images[1]} alt={detail.imageNotes[1].alt} width={detail.imageNotes[1].width} height={detail.imageNotes[1].height} sizes="(max-width:767px) 90vw, 400px"/><figcaption>{detail.imageNotes[1].caption}</figcaption></figure>}
            </div>
          </section>
        </>}
        <section className={styles.section} id="applications" aria-labelledby="applications-title"><p className={styles.eyebrow}>APPLICATIONS & BOUNDARIES</p><h2 id="applications-title">适用任务与使用边界</h2>
          <div className={styles.grid}>{tasks.map(task => <div className={styles.card} key={task.id}><h3>{task.name}</h3><p>{task.description}</p><p className={styles.notice}>{task.boundary}</p><Link href={`/solutions#${task.id}`}>了解{task.name}方案 →</Link></div>)}</div>
        </section>
        <section className={styles.section} id="specifications" aria-labelledby="next-title"><h2 id="next-title">技术规格与购买方案</h2><p>{detail.statusNote}</p><div className={styles.actions}>{purchase}<Link href={links.specsHref}>查看技术规格</Link></div></section>
      </> : <>
        <header className={styles.specHeader}><p className={styles.eyebrow}><ProductStatusBadge status={product.status}/></p><h1>{product.name}<span>技术规格</span></h1><p className={styles.notice}>{detail.statusNote}</p><div className={styles.actions}>{purchase}<Link href={links.overviewHref}>产品介绍</Link></div></header>
        {getOfferingSpecificationGroups(product).map(group => <section className={styles.section} key={group.title}><h2>{group.title}</h2><dl className={styles.specs}>{group.fields.map(spec => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}{spec.note && <small>{spec.note}</small>}</dd></div>)}</dl></section>)}
        {detail.compatibility && <section className={styles.section}><h2>支持设备与适配边界</h2><dl className={styles.specs}>{detail.compatibility.map(device => <div key={device.name}><dt>{device.name}</dt><dd>{device.status}<small>{device.description}</small></dd></div>)}</dl><p>{detail.compatibilityNote}</p></section>}
        <section className={styles.section}><h2>包含内容与购买方案</h2><p>{detail.bundleNote ?? product.specifications?.find(spec => spec.label === "交付范围")?.value}</p><p>具体包含内容以所选标准套餐为准，兼容设备不等于包装内包含设备。</p><div className={styles.actions}>{purchase}<Link href={links.overviewHref}>返回产品介绍</Link></div></section>
      </>}
    </div>
    <div id="product-content-end" className={styles.marker} aria-hidden="true"/>
  </article>;
}
