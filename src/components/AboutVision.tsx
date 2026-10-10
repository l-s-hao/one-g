"use client";
import { useLocale } from "@/i18n/LocaleProvider";
import styles from "@/app/about/about.module.css";

export default function AboutVision() {
  const { locale } = useLocale();
  return <p className={styles.vision}>{locale === "en" ? <>
    Let more people<span className={styles.visionLine}><strong>afford robots</strong> and <strong>use them well,</strong></span><span className={styles.visionLine}>so robots <strong>really help people work.</strong></span>
  </> : <>
    让更多人<span className={styles.visionLine}><strong>用得起</strong>、<strong>用得好</strong>机器人，</span><span className={styles.visionLine}>让机器人<strong>真正帮人干活。</strong></span>
  </>}</p>;
}
