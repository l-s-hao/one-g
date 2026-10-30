"use client";

import { useEffect, useRef, useState } from "react";
import BrandLogo from "./BrandLogo";
import { headerLogoPaths } from "./header-logo-paths";
import styles from "./HeaderLogo.module.css";

// A new document may play again; HeaderNavigation remounts must not replay the intro.
const introduced = new WeakSet<Document>();
type Run = { id: number; source: "intro" | "interaction" };

export default function HeaderLogo({ desktopClassName, mobileClassName }: { desktopClassName: string; mobileClassName: string }) {
  const root = useRef<HTMLSpanElement>(null);
  const [run, setRun] = useState<Run | null>(null);
  const active = useRef<Run | null>(null);
  const sequence = useRef(0);
  const watchdog = useRef<ReturnType<typeof setTimeout> | null>(null);

  function finish(id?: number) {
    if (id !== undefined && active.current?.id !== id) return;
    if (watchdog.current !== null) clearTimeout(watchdog.current);
    watchdog.current = null;
    active.current = null;
    setRun(null);
  }

  useEffect(() => {
    const element = root.current;
    const link = element?.closest("a");
    if (!element || !link) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const hover = matchMedia("(hover: hover) and (pointer: fine)");
    let disposed = false;
    function start(source: Run["source"]) {
      if (reduced.matches || document.visibilityState === "hidden") return;
      // Do not stack pointer/focus animation on the initial reveal.
      if (active.current?.source === "intro") return;
      if (watchdog.current !== null) clearTimeout(watchdog.current);
      const next = { id: ++sequence.current, source };
      active.current = next;
      setRun(next);
      // Fail open to the original mask even if an animationend event is lost.
      watchdog.current = setTimeout(() => finish(next.id), 1900);
    }
    const enter = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && hover.matches) start("interaction");
    };
    const leave = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && hover.matches) finish();
    };
    const focus = () => { if (link!.matches(":focus-visible")) start("interaction"); };
    const cancel = () => finish();
    const preference = () => { if (reduced.matches) finish(); };
    const visibility = () => { if (document.visibilityState === "hidden") finish(); };
    link.addEventListener("pointerenter", enter);
    link.addEventListener("pointerleave", leave);
    link.addEventListener("focus", focus);
    link.addEventListener("blur", cancel);
    link.addEventListener("click", cancel);
    reduced.addEventListener("change", preference);
    document.addEventListener("visibilitychange", visibility);
    // Claim after Strict Mode's discarded setup; static SVG remains visible before this.
    queueMicrotask(() => {
      if (disposed || introduced.has(document)) return;
      introduced.add(document);
      start("intro");
    });
    return () => {
      disposed = true;
      if (watchdog.current !== null) clearTimeout(watchdog.current);
      watchdog.current = null;
      active.current = null;
      link.removeEventListener("pointerenter", enter);
      link.removeEventListener("pointerleave", leave);
      link.removeEventListener("focus", focus);
      link.removeEventListener("blur", cancel);
      link.removeEventListener("click", cancel);
      reduced.removeEventListener("change", preference);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  return <span ref={root} className={styles.root} aria-hidden="true" data-header-logo data-logo-run={run?.source}>
    {(["horizontal", "mark"] as const).map(variant => {
      const paths = headerLogoPaths[variant];
      return <span key={variant} data-brand-logo={variant} className={`${styles.art} ${variant === "horizontal" ? desktopClassName : mobileClassName}`}>
        <BrandLogo variant={variant} size="sm" context="header" className={styles.original} />
        {run && <svg key={run.id} className={styles.overlay} viewBox={paths.viewBox} aria-hidden="true" focusable="false"
          data-logo-animation onAnimationEnd={event => { if (event.target === event.currentTarget) finish(run.id); }}>
          <path data-logo-part="fill" className={styles.fill} d={paths.symbol} fill="currentColor" />
          <path data-logo-part="outer" className={styles.outer} d={paths.outer} pathLength="1" />
          <path data-logo-part="main" className={`${styles.inner} ${styles.main}`} d={paths.innerSegments.main} pathLength="1" />
          <path data-logo-part="connection" className={`${styles.inner} ${styles.connection}`} d={paths.innerSegments.connection} pathLength="1" />
          <path data-logo-part="detail" className={`${styles.inner} ${styles.detail}`} d={paths.innerSegments.detail} pathLength="1" />
          <g data-logo-part="english" className={styles.english} fill="currentColor">{paths.words.slice(4).map((d, index) => <path key={index} d={d} />)}</g>
          <g data-logo-part="chinese" className={styles.chinese} fill="currentColor">{paths.words.slice(0, 4).map((d, index) => <path key={index} d={d} />)}</g>
        </svg>}
      </span>;
    })}
  </span>;
}
