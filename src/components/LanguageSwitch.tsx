"use client";
import { useLocale } from "@/i18n/LocaleProvider";
import styles from "./LanguageSwitch.module.css";
export default function LanguageSwitch({ iconOnly = false, choicesClassName }: { iconOnly?: boolean; choicesClassName?: string }) {
  const { locale, setLocale } = useLocale();
  const label = locale === "zh-CN" ? "切换为英文" : "Switch to Chinese";
  if (choicesClassName) return <div className={choicesClassName} role="group" aria-label={locale === "zh-CN" ? "语言" : "Language"}>
    <button type="button" lang="zh-CN" aria-pressed={locale === "zh-CN"} onClick={() => setLocale("zh-CN")}>中文</button>
    <button type="button" lang="en" aria-pressed={locale === "en"} onClick={() => setLocale("en")}>English</button>
  </div>;
  if (iconOnly) return <button type="button" data-language-toggle aria-label={label} title={label} onClick={() => setLocale(locale === "zh-CN" ? "en" : "zh-CN")}><span className={styles.icon} aria-hidden="true" /></button>;
  return <div className={styles.switch} role="group" aria-label={locale === "zh-CN" ? "语言" : "Language"}>
    <button type="button" lang="zh-CN" aria-pressed={locale === "zh-CN"} onClick={() => setLocale("zh-CN")}>中文</button>
    <span aria-hidden="true">/</span>
    <button type="button" lang="en" aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button>
  </div>;
}
