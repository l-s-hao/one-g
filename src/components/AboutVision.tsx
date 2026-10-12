"use client";
import { translate, useLocale } from "@/i18n/LocaleProvider";
import { brandCopy } from "@/i18n/dictionary";
import styles from "@/app/about/about.module.css";

export default function AboutVision() {
  const { locale } = useLocale();
  const vision = translate(brandCopy.vision, locale);
  const intro = locale === "en" ? "Enable more people to " : "让更多人";
  const separator = locale === "en" ? ", " : "，";
  const [access, purpose] = vision.slice(intro.length).split(separator);
  const emphasize = (text: string) => text.split(/(用得起|用得好|真正帮人干活|afford|use robots effectively|truly help people get work done)/)
    .map((part, index) => index % 2 ? <strong key={index}>{part}</strong> : part);
  return <p className={styles.vision}>
    {intro}<span className={styles.visionLine}>{emphasize(access)}{separator.trim()}</span>
    <span className={styles.visionLine}>{locale === "en" ? " " : ""}{emphasize(purpose)}</span>
  </p>;
}
