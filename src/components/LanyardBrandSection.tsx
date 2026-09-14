"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { lanyardAssets } from "./Lanyard/assets";
import styles from "./LanyardBrandSection.module.css";

const Lanyard = dynamic(() => import("./Lanyard/Lanyard"), { ssr: false });

export default function LanyardBrandSection() {
  const section = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    // Warm the lazy module and loader caches while the visitor reads About.
    const preload = () => {
      if (disposed) return;
      void import("./Lanyard/Lanyard").then(module => {
        if (!disposed) module.preloadLanyard();
      }).catch(() => { /* A failed speculative import can retry on mount. */ });
    };
    const idle = "requestIdleCallback" in window
      ? window.requestIdleCallback(preload, { timeout: 2000 }) : null;
    const timer = idle === null ? setTimeout(preload, 1000) : null;
    const nearby = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setMounted(true);
        nearby.disconnect();
      }
    }, { rootMargin: "400px" });
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (section.current) {
      nearby.observe(section.current);
      observer.observe(section.current);
    }
    return () => {
      disposed = true;
      if (idle !== null) window.cancelIdleCallback(idle);
      if (timer !== null) clearTimeout(timer);
      nearby.disconnect();
      observer.disconnect();
    };
  }, []);

  return <section ref={section} className={styles.section} aria-label="ONE-G 品牌互动吊牌" id="brand-lanyard">
    {!ready && <p className={styles.loading} role="status">正在准备互动吊牌…</p>}
    {mounted && <Lanyard
      active={visible}
      onReady={() => setReady(true)}
      position={[0, 0, 24]}
      gravity={[0, -40, 0]}
      frontImage={lanyardAssets.front}
      backImage={lanyardAssets.back}
      imageFit="contain"
      lanyardImage={lanyardAssets.band}
      lanyardWidth={1}
    />}
    <p className={styles.hint}>拖动吊牌，自由探索</p>
  </section>;
}
