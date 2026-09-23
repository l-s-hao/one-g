"use client";

import { Accessibility } from "lucide-react";
import { useEffect, useRef } from "react";
import ThemeSelector from "./ThemeSelector";
import styles from "./AccessibilityControls.module.css";

export default function AccessibilityControls({ mobile = false }: { mobile?: boolean }) {
  const details = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (mobile) return;
    const outside = (event: PointerEvent) => {
      if (details.current && event.target instanceof Node && !details.current.contains(event.target)) details.current.open = false;
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && details.current?.open) {
        details.current.open = false;
        details.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [mobile]);
  const options = <ThemeSelector />;
  return mobile ? <div className={styles.mobile}>{options}</div> : <details ref={details} className={styles.control}><summary aria-label="显示设置" title="Accessibility"><Accessibility size={19} aria-hidden="true" /></summary><div className={styles.popover}>{options}</div></details>;
}
