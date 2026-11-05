import { LArticle, LDiv, LFigure, LH1, LH2, LH3, LNav, LP, LSection, LSpan, LocalizedImage as Image, LocalizedLink as Link } from "@/i18n/Elements";
import { brandCopy } from "@/i18n/dictionary";
import { getHomeContent } from "@/lib/home-content";
import EvidenceVideos from "./EvidenceVideos";
import MediaSources from "./MediaSources";
import SupportButton from "./SupportButton";
import styles from "./HomeLanding.module.css";

export default function HomeLanding() {
  const { dock, dockHref, categories, products, teleoperation, demo, scenes, aboutHref, productsHref, solutionsHref } = getHomeContent();
  const dockImage = dock.detail!.imageNotes[0];
  return <LDiv className={styles.page} data-home-landing>
    <LSection id="home-introduction" data-home-section="hero" className={`${styles.shell} ${styles.hero}`} aria-labelledby="home-title">
      <LH1 id="home-title">{brandCopy.slogan}</LH1>
      <LH2 id="home-products-robotdock-title">{dock.name}</LH2>
      <LP className={styles.heroStatus}><LSpan>{dock.detail!.statusNote}</LSpan>{" "}<LSpan>{dockImage.caption}</LSpan></LP>
      <LDiv className={styles.actions}><Link effect="invert" href={dockHref}>了解 RoboDock</Link><Link effect="invert" effectVariant="secondary" href={solutionsHref}>查看解决方案</Link></LDiv>
      <LFigure className={styles.heroMedia}><Image src={dockImage.webSrc ?? dock.images[0]} alt={dockImage.alt} width={dockImage.width} height={dockImage.height} priority sizes="(max-width:600px) 90vw, 520px" /></LFigure>
    </LSection>
    <LNav data-home-section="categories" className={`${styles.shell} ${styles.categories}`} aria-label="商品分类">
      {categories.map(item => <Link key={item.href} intent="ordinary" href={item.href}>{item.label}<LSpan aria-hidden="true">↗</LSpan></Link>)}
    </LNav>
    <LSection id="home-products" data-home-section="products" className={`${styles.shell} ${styles.section}`} aria-labelledby="home-products-title">
      <LDiv className={styles.heading}><LH2 id="home-products-title">产品</LH2><Link intent="ordinary" href={productsHref}>查看全部商品 <LSpan aria-hidden="true">→</LSpan></Link></LDiv>
      <LDiv className={styles.products}>
        {products.map(({ product, href }) => <LArticle key={product.id} className={styles.product} data-home-product={product.id} aria-labelledby={`home-products-${product.id}-title`}>
          <LH3 id={`home-products-${product.id}-title`}>{product.name}</LH3>
          {/* 普通商品仍是原型数据；渲染图不构成型号/交付证明，首页也不展示Mock价格或购买承诺。 */}
          <LP className={styles.condition}>渲染参考 · 型号、参数与交付待确认。</LP>
          <Link href={href} className={styles.productMedia} aria-label={`了解更多：${product.name}`}><Image src={product.images[0]} alt="产品渲染参考图，型号尚未确认。" width={3840} height={product.id === "g1" ? 2159 : 2160} sizes="(max-width:767px) 90vw, (max-width:1440px) 44vw, 640px" /></Link>
          <Link className={styles.productAction} effect="invert" effectVariant="secondary" href={href}>了解产品 <LSpan aria-hidden="true">→</LSpan></Link>
        </LArticle>)}
      </LDiv>
    </LSection>
    <LSection id="home-solutions" data-home-section="solutions" className={`${styles.shell} ${styles.section} ${styles.solutions}`} aria-labelledby="home-solutions-title">
      <LDiv className={styles.solutionIntro}>
        <LDiv><LH2 id="home-solutions-title">{teleoperation.content!.name}</LH2><LP className={styles.subtitle}>遥操作解决方案</LP></LDiv>
        <LDiv><LP className={styles.condition}>{demo?.boundary ?? teleoperation.boundary}</LP><LDiv className={styles.actions}><Link effect="invert" href={teleoperation.detailHref!}>查看遥操作方案</Link>{demo && <Link effect="invert" effectVariant="secondary" href="#home-demo">观看演示</Link>}</LDiv></LDiv>
      </LDiv>
      {/* 只挂载一个共享播放器；首次可见静音播放由共享协调器管理，不复用研究画面冒充商品。 */}
      <LDiv id="home-demo" className={styles.demo}>{demo ? <EvidenceVideos ids={[demo.id]} layout="feature" /> : <Image src={teleoperation.media.src} alt={teleoperation.media.alt} width={teleoperation.media.width} height={teleoperation.media.height} sizes="90vw" />}</LDiv>
      <LNav className={styles.scenes} aria-label="解决方案场景">{scenes.map(({ solution, href }) => <Link key={solution.id} intent="ordinary" href={href}>{solution.name}<LSpan aria-hidden="true">→</LSpan></Link>)}</LNav>
    </LSection>
    <LSection id="home-contact" data-home-section="company" className={`${styles.shell} ${styles.section} ${styles.closing}`} aria-labelledby="home-company-title">
      <LH2 id="home-company-title">让机器人真正帮人干活。</LH2>
      <LDiv className={styles.actions}><Link effect="invert" href={aboutHref}>了解万机</Link><SupportButton effect="invert" inline entry="general" /></LDiv>
      <LP className={styles.condition}>登录后填写需求 · 当前仅支持前端预览</LP>
      {/* 台账要求的署名只在本页资料区集中一次，不重新挂到各媒体下方。 */}
      {demo && <MediaSources demoIds={[demo.id]} />}
    </LSection>
  </LDiv>;
}
