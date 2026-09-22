import { ArrowUpRight } from "lucide-react";
import LanyardBrandSection from "@/components/LanyardBrandSection";
import AboutHero from "@/components/AboutHero";
import { siteContact } from "@/data/site-contact";
import styles from "./about.module.css";

export default function AboutPage() {
  return <div className={styles.page}>
    <AboutHero />
    <article className="home-content-shell">
    <section className={`${styles.section} ${styles.statementSection}`} id="our-vision" aria-labelledby="vision-title">
      <header className={styles.sectionLabel}>
        <p className={styles.eyebrow}>02 / OUR VISION</p>
        <h2 id="vision-title">我们的愿景</h2>
      </header>
      <p className={styles.vision}>让更多人<span className={styles.visionLine}><strong>用得起</strong>、<strong>用得好</strong>机器人，</span><span className={styles.visionLine}>让机器人<strong>真正帮人干活。</strong></span></p>
    </section>

    <section className={`${styles.section} ${styles.statementSection}`} id="our-positioning" aria-labelledby="positioning-title">
      <header className={styles.sectionLabel}>
        <p className={styles.eyebrow}>03 / OUR POSITIONING</p>
        <h2 id="positioning-title">我们的定位</h2>
      </header>
      <div className={styles.positioning}>
        <h3>机器人开发与应用平台</h3>
        <p className={styles.positioningBody}>做机器人开发与应用平台，把模型、软件和硬件接起来，让客户不必每次从头开发。</p>
        <div className={styles.connection} role="group" aria-label="模型、软件和硬件的连接关系">
          <ul className={styles.connectionNodes}>
            <li>模型</li><li>软件</li><li>硬件</li>
          </ul>
          <p className={styles.connectionNote}>让客户不必每次从头开发。</p>
        </div>
      </div>
    </section>

    <section className={`${styles.section} ${styles.contact}`} aria-labelledby="contact-title">
      <div><p className={styles.eyebrow}>04 / TALK TO ONE-G</p><h2 id="contact-title">TALK TO <br />ONE-G</h2>
        <p className={styles.contactIntro}>如果你有机器人开发与应用需求，欢迎联系我们。</p>
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
