import { LDiv, LH1, LP, LSection, LocalizedImage as Image, LocalizedLink as Link } from "@/i18n/Elements";
import { brandCopy } from "@/i18n/dictionary";
import { aboutNavigation as links } from "@/lib/about-navigation";
import styles from "./AboutHero.module.css";
export default function AboutHero() {
  return <LSection id="company-introduction" className={styles.hero} aria-labelledby="about-hero-title">
    <LDiv className={styles.intro}><LH1 id="about-hero-title">{brandCopy.slogan}</LH1><LP>{brandCopy.positioning}</LP>
      <LDiv className={styles.actions}><Link effect="invert" href={links.dock}>了解 RoboDock</Link><Link effect="invert" effectVariant="secondary" href={links.solutions}>查看解决方案</Link></LDiv>
    </LDiv>
    <Image className={styles.image} src="/one-g/hero/one-g-service.png" alt="ONE-G 万机智能服务机器人" width={1200} height={800} priority />
  </LSection>;
}
