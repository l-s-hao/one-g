"use client";

import { Check } from "lucide-react";
import { themes } from "@/data/themes";
import { useAuth } from "./AuthProvider";
import { useTheme } from "./ThemeProvider";
import styles from "./ThemeSelector.module.css";

export default function ThemeSelector() {
  const { currentUser } = useAuth();
  const { theme, setTheme } = useTheme();
  if (!currentUser) return null;
  return <div className={styles.grid} role="group" aria-label="网站主题">
    {themes.map(option => <button key={option.id} type="button" className={styles.card}
      aria-pressed={theme === option.id} onClick={() => setTheme(option.id)}>
      <span className={styles.swatches} aria-hidden="true">
        {option.colors.map(color => <span key={color} style={{ backgroundColor: color }} />)}
      </span>
      <span className={styles.name}>{option.name}</span>
      {option.id === "color-vision-safe" && <span className={styles.name}>高对比 · 非红绿依赖</span>}
      <span className={styles.selected}>{theme === option.id && <><Check size={14} aria-hidden="true" />当前主题</>}</span>
    </button>)}
  </div>;
}
