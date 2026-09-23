"use client";
import { displayModeName, type SpecialDisplayMode } from "@/data/themes";
import { useTheme } from "./ThemeProvider";
import styles from "./ThemeSelector.module.css";
// Firefox restores dynamic disabled/checked state before hydration on reload.
// React and ThemeProvider own these controls; do not restore browser form state.
// Firefox also supports this attribute on buttons (outside the standard TS button attributes).
const noBrowserStateRestore = { autoComplete: "off" } as const;
const switches: SpecialDisplayMode[] = ["night", "eye-comfort", "color-vision-safe"];
export default function ThemeSelector({ compact = false }: { compact?: boolean }) {
  const { displayMode, ready, setDisplayMode, setModeEnabled } = useTheme();
  return <fieldset className={`${styles.options}${compact ? ` ${styles.compact}` : ""}`} aria-label="显示模式">
    <legend className="sr-only">显示模式</legend>
    <div className={styles.summary}><p aria-live="polite">当前：{displayModeName(displayMode)}</p><button {...noBrowserStateRestore} type="button" onClick={() => setDisplayMode("standard")} disabled={!ready}>{compact ? "恢复标准" : "恢复标准显示"}</button></div>
    {switches.map(mode => <label key={mode}>
      <span>{displayModeName(mode)}</span>
      <input autoComplete="off" type="checkbox" role="switch" aria-label={displayModeName(mode)} checked={displayMode === mode} disabled={!ready} onChange={event => setModeEnabled(mode, event.target.checked)}/>
    </label>)}
  </fieldset>;
}
