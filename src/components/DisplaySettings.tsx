"use client";

import { Moon, Sun } from "lucide-react";
import { LFieldset, LLegend, LSpan } from "@/i18n/Elements";
import LanguageSwitch from "./LanguageSwitch";
import ThemeToggle from "./ThemeToggle";
import styles from "./HeaderBrand.module.css";

/** 复用原Provider与持久化。两组普通选项，不声明没有实现方向键规范的menu。 */
export default function DisplaySettings() {
  return <>
    <LFieldset className={styles.settingGroup}><LLegend>语言</LLegend>
      <LanguageSwitch choicesClassName={styles.settingChoices}/>
    </LFieldset>
    <LFieldset className={styles.settingGroup}><LLegend>外观</LLegend>
      <div className={styles.settingChoices}>
        <ThemeToggle targetTheme="light"><Sun size={16} aria-hidden="true"/><LSpan>日间</LSpan></ThemeToggle>
        <ThemeToggle targetTheme="dark"><Moon size={16} aria-hidden="true"/><LSpan>夜间</LSpan></ThemeToggle>
      </div>
    </LFieldset>
  </>;
}
