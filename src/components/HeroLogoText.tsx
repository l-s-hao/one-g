"use client";

import ShinyText from "./ShinyText";
import styles from "./HeroLogoText.module.css";

export default function HeroLogoText() {
  return (
    <ShinyText
      text="ONE-G"
      speed={3}
      delay={1.5}
      color="#ffffff"
      shineColor="#a3a3a6"
      spread={120}
      direction="left"
      yoyo={false}
      pauseOnHover={false}
      className={styles.text}
    />
  );
}
