"use client";
import { useLocale } from "@/i18n/LocaleProvider";
import styles from "./LanguageSwitch.module.css";
export default function LanguageSwitch() {
  const { locale, setLocale } = useLocale();
  return <div className={styles.switch} role="group" aria-label={locale === "zh-CN" ? "语言" : "Language"}>
    <button type="button" lang="zh-CN" aria-pressed={locale === "zh-CN"} onClick={() => setLocale("zh-CN")}>中文</button>
    <span aria-hidden="true">/</span>
    <button type="button" lang="en" aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button>
  </div>;
}
