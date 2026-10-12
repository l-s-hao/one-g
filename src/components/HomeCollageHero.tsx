"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { LocalizedImage as Image, LocalizedLink as Link, LP, LSpan } from "@/i18n/Elements";
import { translate, useLocale } from "@/i18n/LocaleProvider";
import { brandCopy } from "@/i18n/dictionary";
import styles from "./HomeCollageHero.module.css";

const photos = [
  { src: "/one-g/products/robotdock/robotdock-concept.png", width: 1254, height: 1254 },
  { src: "/one-g/products/home-collage/robot-front.jpg", width: 1280, height: 1707 },
  { src: "/one-g/hero/one-g-arm.png", width: 3840, height: 2160 },
  { src: "/one-g/products/home-collage/vision-device.jpg", width: 1280, height: 1707 },
];
const sequences = [
  ["blue", 0, 1, "ice", 2],
  ["sand", 2, "dark", 3, "blue"],
  ["ice", "white", 3, "sand", 0],
  ["dark", 1, "ice", 0, "blue"],
  ["sand", 3, "blue", 2, "white"],
  ["ice", 0, "dark", 1, "sand"],
] as const;

export default function HomeCollageHero() {
  const root = useRef<HTMLElement>(null);
  const { locale } = useLocale();
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const animations: Animation[] = [];
    let visible = true;
    let entered = false;
    let disposed = false;
    const sync = () => {
      const running = entered && visible && !document.hidden && !preference.matches;
      element.dataset.running = String(running);
      for (const animation of animations) {
        if (animation.playState === "finished" || animation.playState === "idle") continue;
        if (preference.matches) animation.finish();
        else if (visible && !document.hidden && animation.playState === "paused") animation.play();
        else if ((!visible || document.hidden) && animation.playState === "running") animation.pause();
      }
    };
    const motionChanged = () => { setReduced(preference.matches); sync(); };
    motionChanged();
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);
    preference.addEventListener("change", motionChanged);
    try {
      if (!preference.matches && typeof element.animate === "function") {
        const animate = (node: Element, delay: number, duration: number, distance: number) => {
          const animation = node.animate([
            { opacity: 0, transform: `translateY(${distance}px)` },
            { opacity: 1, transform: "translateY(0)" },
          ], { delay, duration, easing: "cubic-bezier(0.16,1,0.3,1)", fill: "backwards" });
          animations.push(animation);
        };
        element.querySelectorAll("[data-reveal]").forEach(node => animate(node, 150, 900, 12));
        element.querySelectorAll("[data-title-line]").forEach((node, i) => animate(node, 300 + i * 85, 1000, 100));
        element.querySelectorAll("[data-copy]").forEach(node => animate(node, 650, 1000, 20));
        element.querySelectorAll("[data-column]").forEach((node, i) => animate(node, 800 + i * 55, 1025, 55));
        // Includes hidden extra columns; the final column ends at exactly 2.10s.
        Promise.all(animations.map(animation => animation.finished)).then(() => {
          if (!disposed) { entered = true; sync(); }
        }).catch(() => { if (!disposed) { entered = true; sync(); } });
      } else { entered = true; sync(); }
    } catch {
      animations.forEach(animation => animation.cancel());
      animations.length = 0;
      entered = true;
      sync();
    }
    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      preference.removeEventListener("change", motionChanged);
      animations.forEach(animation => animation.cancel());
    };
  }, []);

  const heading = translate(brandCopy.slogan, locale);
  const [lead, continuation] = heading.split(", ");
  const lines = locale === "en" ? [`${lead},`, ...continuation.split(" ")] : [heading];
  const vision = translate(brandCopy.vision, locale);
  const separator = locale === "en" ? ", " : "，";
  const [access, purpose] = vision.split(separator);
  return <section ref={root} className={styles.hero} data-paused={paused} data-running="false" aria-labelledby="home-collage-title">
    <div className={styles.copy}>
      <LP className={styles.brand} data-reveal>{brandCopy.positioningLine}</LP>
      <h1 id="home-collage-title" className={styles.title} aria-label={heading}>
        {lines.map((line, i) => <span className={styles.line} key={i} aria-hidden="true"><span data-title-line>{line}</span></span>)}
      </h1>
      <LP className={styles.description} data-copy>
        <span className={styles.descriptionLine}>{access}{separator.trim()}</span>
        <span className={styles.descriptionLine}>{locale === "en" ? " " : ""}{purpose}</span>
      </LP>
      <div className={styles.actions} data-copy><Link intent="ordinary" href="/products">商品中心</Link><Link intent="ordinary" href="/solutions">解决方案</Link></div>
    </div>
    <div className={styles.scene}>
      <div className={styles.columns} aria-hidden="true">
        {sequences.map((sequence, column) => <div key={column} className={styles.column} data-column>
          <div className={styles.track} data-track data-direction={column % 2 === 0 ? "up" : "down"}>
            {[0, 1].map(repeat => <div className={styles.segment} key={repeat}>
              {sequence.map((tile, index) => <div key={index} className={`${styles.tile} ${typeof tile === "string" ? styles[tile] : styles.photo}`}>
                {typeof tile === "number" && <Image {...photos[tile]} alt="" sizes="(max-width: 599px) 32vw, 220px" loading={repeat === 0 && index < 3 ? "eager" : "lazy"} />}
              </div>)}
            </div>)}
          </div>
        </div>)}
      </div>
      <button className={styles.pause} type="button" disabled={reduced} aria-pressed={paused} onClick={() => setPaused(value => !value)}>
        {paused || reduced ? <Play size={14} aria-hidden="true"/> : <Pause size={14} aria-hidden="true"/>}
        <LSpan>{reduced ? "已减少动画" : paused ? "继续拼贴动画" : "暂停拼贴动画"}</LSpan>
      </button>
    </div>
  </section>;
}
