import { LArticle, LDd, LDiv, LDl, LDt, LFigcaption, LFigure, LH1, LH2, LH3, LHeader, LLi, LP, LSection, LSmall, LSpan, LUl } from "@/i18n/Elements";
import { LocalizedImage as Image } from "@/i18n/Elements";
import { LocalizedLink as Link } from "@/i18n/Elements";
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
  return <LArticle data-product-page className={styles.page} id="product-top">
    <ProductLocalNav key={`${product.id}-${view}`} name={product.name} links={links} view={view}/>
    <LDiv className={styles.container}>
      {view === "overview" ? <>
        <LSection className={styles.hero} id="product-hero" aria-labelledby="product-title">
          <LP className={styles.eyebrow}><ProductStatusBadge status={product.status}/></LP>
          <LH1 id="product-title">{product.name}</LH1><LP className={styles.subtitle}>{product.subtitle}</LP>
          <LDiv className={styles.actions}>{purchase}<Link href={links.specsHref}>技术规格</Link></LDiv>
          <LFigure className={styles.mainImage}><Image src={product.images[0]} alt={detail.imageNotes[0].alt} width={detail.imageNotes[0].width} height={detail.imageNotes[0].height} sizes="(max-width:767px) 90vw, 800px" loading="eager"/><LFigcaption>{detail.imageNotes[0].caption}</LFigcaption></LFigure>
          <LP className={styles.heroNotice}>{detail.statusNote}</LP>
        </LSection>
        <LDiv className={styles.marker} id="product-hero-end" aria-hidden="true"/>
        <LSection className={styles.section} aria-labelledby="product-overview-title"><LP className={styles.eyebrow}>PRODUCT OVERVIEW</LP><LH2 id="product-overview-title">了解 {product.name}</LH2><LP>{product.description}</LP>
          {detail.highlights && <LDiv className={styles.grid}>{detail.highlights.map(item => <LDiv className={styles.card} key={item.title}><LH3>{item.title}</LH3><LP>{item.description}</LP></LDiv>)}</LDiv>}
        </LSection>
        {detail.sections ? detail.sections.filter(section => section.id !== "modes").map(section => <LSection id={section.id} key={section.id} className={styles.section} aria-labelledby={`${section.id}-title`}>
          <LP className={styles.eyebrow}>{section.eyebrow}</LP><LH2 id={`${section.id}-title`}>{section.title}</LH2>
          {section.paragraphs?.map(text => <LP key={text}>{text}</LP>)}
          {section.cards && <LDiv className={styles.grid}>{section.cards.map(card => <LDiv className={styles.card} key={card.title}><LH3>{card.title}</LH3><LP>{card.description}</LP>{card.items && <LUl>{card.items.map(item => <LLi key={item}>{item}</LLi>)}</LUl>}</LDiv>)}</LDiv>}
          {section.media && <LDiv className={styles.media}>{section.media.map(media => <LFigure key={media.src}><Image src={media.src} alt={media.alt} width={media.width} height={media.height} sizes="(max-width:767px) 100vw, 80vw"/><LFigcaption>{media.caption}</LFigcaption></LFigure>)}</LDiv>}
          {section.link && <LDiv className={styles.actions}><Link href={section.link.href}>{section.link.label}</Link></LDiv>}
        </LSection>) : <>
          <LSection className={styles.section} aria-labelledby="interface-title"><LP className={styles.eyebrow}>INTERFACE</LP><LH2 id="interface-title">接口与集成 · 规划方案</LH2><LP>{detail.interfaces?.join(" · ")}</LP><LP>{detail.interfaceNote}</LP></LSection>
          <LSection className={styles.section} aria-labelledby="compatibility-title"><LP className={styles.eyebrow}>COMPATIBILITY</LP><LH2 id="compatibility-title">兼容设备 · 分阶段适配</LH2>
            <LDiv className={styles.compatibility}><LDiv>{detail.compatibility?.map(device => <LDiv className={styles.device} key={device.name}><LH3>{device.name}</LH3><LSpan>{device.status}</LSpan><LP>{device.description}</LP></LDiv>)}<LP>{detail.compatibilityNote}</LP></LDiv>
              {product.images[1] && detail.imageNotes[1] && <LFigure className={styles.sketch}><Image src={product.images[1]} alt={detail.imageNotes[1].alt} width={detail.imageNotes[1].width} height={detail.imageNotes[1].height} sizes="(max-width:767px) 90vw, 400px"/><LFigcaption>{detail.imageNotes[1].caption}</LFigcaption></LFigure>}
            </LDiv>
          </LSection>
        </>}
        <LSection className={styles.section} id="applications" aria-labelledby="applications-title"><LP className={styles.eyebrow}>APPLICATIONS & BOUNDARIES</LP><LH2 id="applications-title">适用任务与使用边界</LH2>
          <LDiv className={styles.grid}>{tasks.map(task => <LDiv className={styles.card} key={task.id}><LH3>{task.name}</LH3><LP>{task.description}</LP><LP className={styles.notice}>{task.boundary}</LP><Link href={`/solutions#${task.id}`}>了解{task.name}方案 →</Link></LDiv>)}</LDiv>
        </LSection>
        <LSection className={styles.section} id="specifications" aria-labelledby="next-title"><LH2 id="next-title">技术规格与购买方案</LH2><LP>{detail.statusNote}</LP><LDiv className={styles.actions}>{purchase}<Link href={links.specsHref}>查看技术规格</Link></LDiv></LSection>
      </> : <>
        <LHeader className={styles.specHeader}><LP className={styles.eyebrow}><ProductStatusBadge status={product.status}/></LP><LH1>{product.name}<LSpan>技术规格</LSpan></LH1><LP className={styles.notice}>{detail.statusNote}</LP><LDiv className={styles.actions}>{purchase}<Link href={links.overviewHref}>产品介绍</Link></LDiv></LHeader>
        {getOfferingSpecificationGroups(product).map(group => <LSection className={styles.section} key={group.title}><LH2>{group.title}</LH2><LDl className={styles.specs}>{group.fields.map(spec => <LDiv key={spec.label}><LDt>{spec.label}</LDt><LDd>{spec.value}{spec.note && <LSmall>{spec.note}</LSmall>}</LDd></LDiv>)}</LDl></LSection>)}
        {detail.compatibility && <LSection className={styles.section}><LH2>支持设备与适配边界</LH2><LDl className={styles.specs}>{detail.compatibility.map(device => <LDiv key={device.name}><LDt>{device.name}</LDt><LDd>{device.status}<LSmall>{device.description}</LSmall></LDd></LDiv>)}</LDl><LP>{detail.compatibilityNote}</LP></LSection>}
        <LSection className={styles.section}><LH2>包含内容与购买方案</LH2><LP>{detail.bundleNote ?? product.specifications?.find(spec => spec.label === "交付范围")?.value}</LP><LP>具体包含内容以所选标准套餐为准，兼容设备不等于包装内包含设备。</LP><LDiv className={styles.actions}>{purchase}<Link href={links.overviewHref}>返回产品介绍</Link></LDiv></LSection>
      </>}
    </LDiv>
    <LDiv id="product-content-end" className={styles.marker} aria-hidden="true"/>
  </LArticle>;
}
