import { LArticle, LDiv, LH2, LH3, LHeader, LLi, LP, LSection, LUl } from "@/i18n/Elements";
import AboutVision from "@/components/AboutVision";
import LanyardBrandSection from "@/components/LanyardBrandSection";
import AboutHero from "@/components/AboutHero";
import SupportButton from "@/components/SupportButton";
import { brandCopy } from "@/i18n/dictionary";
import styles from "./about.module.css";

export default function AboutPage() {
  return <LDiv className={styles.page}>
    <AboutHero />
    <LArticle className="home-content-shell">
    <LSection className={`${styles.section} ${styles.statementSection}`} id="our-vision" aria-labelledby="vision-title">
      <LHeader className={styles.sectionLabel}>
        <LP className={styles.eyebrow}>02 / OUR VISION</LP>
        <LH2 id="vision-title">我们的愿景</LH2>
      </LHeader>
      <AboutVision />
    </LSection>

    <LSection className={`${styles.section} ${styles.statementSection}`} id="our-positioning" aria-labelledby="positioning-title">
      <LHeader className={styles.sectionLabel}>
        <LP className={styles.eyebrow}>03 / OUR POSITIONING</LP>
        <LH2 id="positioning-title">我们的定位</LH2>
      </LHeader>
      <LDiv className={styles.positioning}>
        <LH3>{brandCopy.positioning}</LH3>
        <LP className={styles.positioningBody}>{brandCopy.explanation}</LP>
        <LDiv className={styles.connection} role="group" aria-label="模型、软件和硬件的连接关系">
          <LUl className={styles.connectionNodes}>
            <LLi>模型</LLi><LLi>软件</LLi><LLi>硬件</LLi>
          </LUl>
          <LP className={styles.connectionNote}>让客户不必每次从头开发。</LP>
        </LDiv>
      </LDiv>
    </LSection>

    <LSection className={`${styles.section} ${styles.contact}`} aria-labelledby="contact-title">
      <LP className={styles.eyebrow}>04 / TALK TO ONE-G</LP><LH2 id="contact-title">TALK TO ONE-G</LH2>
      <LP className={styles.contactIntro}>如果你有机器人开发与应用需求，欢迎与我们沟通。</LP>
      <SupportButton effect="invert" inline entry="about" className={styles.contactButton}/>
      <LP className={styles.contactNote}>登录后填写需求 · 当前仅支持前端预览</LP>
    </LSection>
    </LArticle>
    <LanyardBrandSection />
  </LDiv>;
}
