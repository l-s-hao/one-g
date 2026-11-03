"use client";

import { LDiv, LH1, LH2, LP, LSection, LocalizedLink as Link } from "@/i18n/Elements";


import { useSyncExternalStore } from "react";
import BrandLogo from "./BrandLogo";
import ScrollExpand from "./ScrollExpand/ScrollExpand";
import { brandCopy } from "@/i18n/dictionary";
import { aboutNavigation as links } from "@/lib/about-navigation";
import styles from "./AboutHero.module.css";

const mobileQuery = "(max-width: 767px)";
function subscribe(onChange: () => void) {
  const query = window.matchMedia(mobileQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const getSnapshot = () => window.matchMedia(mobileQuery).matches;
const getServerSnapshot = () => false;

export default function AboutHero() {
  const isMobile = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return <LSection className={styles.hero} aria-labelledby="about-hero-title">
    <LH1 id="about-hero-title" className="sr-only">ABOUT ONE-G</LH1>
    {/* 操作区不放进随进度隐藏的 overlay，键盘和减少动画用户无需等待展开。 */}
    <LDiv className={styles.intro}><LP>{brandCopy.positioning}</LP><LDiv className={styles.actions}><Link effect="invert" href={links.dock}>了解 RoboDock</Link><Link effect="invert" effectVariant="secondary" href={links.solutions}>查看解决方案</Link></LDiv></LDiv>
    <ScrollExpand
      key={isMobile ? "mobile" : "desktop"}
      src="/one-g/hero/one-g-service.png"
      alt="ONE-G 万机智能服务机器人"
      title="ABOUT ONE-G"
      scrollHint="SCROLL"
      useWindowScroll
      startWidth={isMobile ? 84 : 42}
      startHeight={isMobile ? 52 : 58}
      mediaZoom={1.35}
      overlayScrim={0.55}
    >
      <LDiv className={styles.expanded}>
        <BrandLogo variant="stacked" size="lg" className={styles.logo} />
        <LH2>ONE-G / 万机智能</LH2>
        <LP>{brandCopy.slogan}</LP>
      </LDiv>
    </ScrollExpand>
  </LSection>;
}
