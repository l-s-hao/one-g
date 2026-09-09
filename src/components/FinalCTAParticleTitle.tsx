"use client";

import { useEffect, useRef, useState } from "react";
import ParticleText from "./ParticleText";
import styles from "./AboutCTASection.module.css";

export default function FinalCTAParticleTitle() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setStarted(true);
      observer.disconnect();
    }, { threshold: 0.2 });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={styles.particleMount}>
      {started && (
        <ParticleText
          text="BUILD YOUR ONE-G"
          particleSize={1.7}
          density={4}
          color="#ffffff"
          highlightColor="#ffffff"
          scatter={180}
          gatherDuration={1000}
          stagger={420}
          pointerRepel={40}
          repelRadius={180}
          idleDrift={0.5}
          trigger="mount"
          fontSize="clamp(3rem, 12vw, 8rem)"
          fontWeight={800}
          fontFamily="inherit"
          glow
        />
      )}
    </div>
  );
}
