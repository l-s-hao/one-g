"use client";

import { Check, Palette } from "lucide-react";
import { useEffect, useRef } from "react";
import { themes } from "@/data/themes";
import { useTheme } from "./ThemeProvider";
import styles from "./ThemeSelector.module.css";

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const details = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (event.target instanceof Node && !details.current?.contains(event.target)) details.current?.removeAttribute("open");
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  return <details ref={details} className={styles.selector} onKeyDown={event => {
    if (event.key === "Escape") { details.current?.removeAttribute("open"); details.current?.querySelector("summary")?.focus(); }
  }}>
    <summary aria-label="选择颜色主题" title="选择颜色主题"><Palette size={18} strokeWidth={1.7} /></summary>
    <div className={styles.menu} role="group" aria-label="颜色主题">
      {themes.map(option => <button key={option.id} type="button" aria-pressed={theme === option.id} onClick={() => {
        setTheme(option.id); details.current?.removeAttribute("open");
      }}><span>{option.name}</span>{theme === option.id && <Check size={15} aria-hidden="true" />}</button>)}
    </div>
  </details>;
}
