"use client";

import { useId } from "react";
import { accessibilityThemes } from "@/data/themes";
import { useTheme } from "./ThemeProvider";
import styles from "./AccessibilityControls.module.css";

export default function AccessibilityThemeSelector({ compact = false }: { compact?: boolean }) {
  const { accessibilityTheme, setAccessibilityTheme } = useTheme();
  const id = useId();
  return <fieldset className={styles.options} aria-label="显示辅助">
    <legend>显示辅助</legend>
    <label><input type="radio" name={id} checked={accessibilityTheme === null} onChange={() => setAccessibilityTheme(null)} /><span>标准显示</span></label>
    {accessibilityThemes.map(option => <label key={option.id}><input type="radio" name={id} checked={accessibilityTheme === option.id} onChange={() => setAccessibilityTheme(option.id)} /><span>{compact ? option.name.split(" / ")[0] : option.name}</span></label>)}
  </fieldset>;
}
