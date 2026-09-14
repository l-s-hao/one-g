"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import styles from "./LanyardBrandSection.module.css";

const Lanyard = dynamic(() => import("./Lanyard/Lanyard"), { ssr: false });

export default function LanyardBrandSection() {
  const section = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "200px" });
    if (section.current) observer.observe(section.current);
    return () => observer.disconnect();
  }, []);

  return <section ref={section} className={styles.section} aria-label="ONE-G 品牌互动吊牌" id="brand-lanyard">
    {visible && <Lanyard
      position={[0, 0, 24]}
      gravity={[0, -40, 0]}
      frontImage="/one-g/brand/one-g-mark.png"
      backImage="/one-g/brand/one-g-stacked.svg"
      imageFit="contain"
      lanyardImage="/one-g/lanyard/one-g-band.png"
      lanyardWidth={1}
    />}
    <p className={styles.hint}>拖动吊牌，自由探索</p>
  </section>;
}
