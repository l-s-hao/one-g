"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { LSection, LP, LocalizedImage } from "@/i18n/Elements";
import { lanyardAssets } from "./Lanyard/assets";
import LocalEffectBoundary from "./LocalEffectBoundary";
import styles from "./LanyardBrandSection.module.css";

const Lanyard = dynamic(() => import("./Lanyard/Lanyard"), { ssr: false });
export default function LanyardBrandSection() {
  const section = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const nearby = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setMounted(true); nearby.disconnect(); }
    }, { rootMargin: "400px" });
    if (section.current) nearby.observe(section.current);
    return () => nearby.disconnect();
  }, []);
  return <LSection ref={section} className={styles.section} aria-label="ONE-G 品牌互动吊牌" id="brand-lanyard">
    <div className={styles.fallback}><LocalizedImage src={lanyardAssets.front} alt="ONE-G" width={180} height={180}/></div>
    {mounted && <LocalEffectBoundary><Lanyard frontImage={lanyardAssets.front} backImage={lanyardAssets.back}
      strapImage={lanyardAssets.band} imageFit="contain" /></LocalEffectBoundary>}
    <LP className={styles.hint}>拖动吊牌，自由探索</LP>
  </LSection>;
}
