import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import LanyardBrandSection from "@/components/LanyardBrandSection";
import AboutHero from "@/components/AboutHero";
import { siteContact } from "@/data/site-contact";
import styles from "./about.module.css";

const capabilities = [
  { title: "ROBOT PLATFORM", label: "机器人平台", description: "构建可扩展的机器人平台。", image: "one-g-service.png", alt: "ONE-G 服务机器人本体" },
  { title: "MODULAR HARDWARE", label: "模块化硬件", description: "机械臂、末端执行器、视觉与感知模块。", image: "one-g-arm.png", alt: "ONE-G 机械臂产品" },
  { title: "CONFIGURATION", label: "配置中心", description: "通过可视化方式组合机器人硬件与能力。", image: "one-g-mobile.png", alt: "ONE-G 移动机器人硬件平台" },
];
const principles = [
  { title: "MODULAR", label: "模块化", description: "标准硬件与能力按兼容规则组合。" },
  { title: "INTUITIVE", label: "直观", description: "复杂机器人配置变得容易理解。" },
  { title: "OPEN", label: "开放", description: "为软件与智能能力保留扩展空间。" },
  { title: "SCALABLE", label: "可扩展", description: "从单一模块扩展到完整机器人系统。" },
];

export default function AboutPage() {
  return <div className={styles.page}>
    <AboutHero />
    <article className="home-content-shell">
    <section className={styles.section} id="what-we-build" aria-labelledby="build-title">
      <p className={styles.eyebrow}>02 / WHAT WE BUILD</p>
      <div className={styles.sectionHeading}><h2 id="build-title">WHAT WE BUILD</h2><p>我们在做什么</p></div>
      <div className={styles.builds}>{capabilities.map((item, index) => <div className={styles.build} key={item.title}>
        <div className={styles.buildCopy}>
          <span className={styles.number}>0{index + 1}</span>
          <h3>{item.title}</h3><p className={styles.chinese}>{item.label}</p><p className={styles.description}>{item.description}</p>
        </div>
        <div className={styles.productImage}><Image src={`/one-g/hero/${item.image}`} alt={item.alt} fill sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1913px) 55vw, 1050px" /></div>
      </div>)}</div>
    </section>

    <section className={styles.section} aria-labelledby="why-title">
      <p className={styles.eyebrow}>03 / WHY ONE-G</p>
      <div className={styles.sectionHeading}><h2 id="why-title">WHY ONE-G</h2><p>我们的核心理念</p></div>
      <div className={styles.principles}>{principles.map((item) => <div className={styles.principle} key={item.title}>
        <h3>{item.title}</h3><p className={styles.chinese}>{item.label}</p><p className={styles.description}>{item.description}</p>
      </div>)}</div>
    </section>

    <section className={`${styles.section} ${styles.contact}`} aria-labelledby="contact-title">
      <div><p className={styles.eyebrow}>04 / TALK TO ONE-G</p><h2 id="contact-title">TALK TO <br />ONE-G</h2>
        <p className={styles.contactIntro}>如果你正在寻找机器人本体、模块化硬件或配置方案，欢迎联系我们。</p>
        <a className={styles.contactButton} href="#contact-details">咨询客服 <ArrowUpRight size={18} aria-hidden="true" /></a>
      </div>
      <div id="contact-details" className={styles.contactDetails} tabIndex={-1}>
        <dl><div><dt>客服电话</dt><dd><a href={`tel:${siteContact.phone.replace(/\s/g, "")}`}>{siteContact.phone}<ArrowUpRight size={20} aria-hidden="true" /></a></dd></div>
          <div><dt>客服邮箱</dt><dd><a href={`mailto:${siteContact.email}`}>{siteContact.email}<ArrowUpRight size={20} aria-hidden="true" /></a></dd></div></dl>
        <p className={styles.contactNote}>当前为演示联系信息，正式联系方式待确认。</p>
      </div>
    </section>
    </article>
    <LanyardBrandSection />
  </div>;
}
