"use client";

import { useSyncExternalStore } from "react";
import BrandLogo from "./BrandLogo";
import ScrollExpand from "./ScrollExpand/ScrollExpand";
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

  return <section className={styles.hero} aria-labelledby="about-hero-title">
    <h1 id="about-hero-title" className="sr-only">ABOUT ONE-G</h1>
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
      <div className={styles.expanded}>
        <BrandLogo variant="stacked" size="lg" className={styles.logo} />
        <h2>ONE-G / 万机智能</h2>
        <p>ONE-G — 可配置的智能机器人平台。</p>
      </div>
    </ScrollExpand>
  </section>;
}
