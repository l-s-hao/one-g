"use client";

import Link from "next/link";
import localFont from "next/font/local";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import styles from "./HomeVideoHero.module.css";

const inter = localFont({
  src: "./fonts/InterVariable.ttf",
  weight: "300 600",
  display: "swap",
  fallback: ["Arial", "Helvetica", "sans-serif"],
});

const ease = [0.16, 1, 0.3, 1] as const;
const videoUrl = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4";

export default function HomeVideoHero() {
  const reducedMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  useEffect(() => {
    // Cached media can finish loading (or fail) before React attaches its handlers.
    let active = true;
    void Promise.resolve().then(() => {
      const video = videoRef.current;
      if (!active || !video) return;
      if (video.error) setVideoFailed(true);
      else if (video.readyState >= 2) setVideoReady(true);
    });
    return () => { active = false; };
  }, []);
  const entrance = (y: number, delay: number, duration = 0.8) => ({
    // Keep SSR and hydration identical; the media query removes transforms
    // before first paint for reduced-motion users.
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { ease, delay: reducedMotion ? 0 : delay, duration: reducedMotion ? 0.15 : duration },
  });

  return (
    <section className={`${styles.hero} ${inter.className}`} aria-labelledby="home-video-title">
      <div className={styles.mediaWindow} aria-hidden="true" hidden={videoFailed}>
        <motion.div
          className={styles.media}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reducedMotion ? 0.15 : 1.8, ease }}
        >
          <video
            ref={videoRef}
            className={styles.video}
            data-ready={videoReady}
            src={videoUrl}
            autoPlay muted playsInline loop preload="metadata"
            onLoadedData={() => setVideoReady(true)}
            onError={() => setVideoFailed(true)}
          />
        </motion.div>
      </div>
      <div className={styles.fade} aria-hidden="true" />
      <motion.div className={styles.content} {...entrance(20, 0.5, 1)}>
        <div className={styles.copy}>
          <motion.p className={styles.eyebrow} {...entrance(16, 0.6)}>
            <span aria-hidden="true" />ONE-G / EMBODIED INTELLIGENCE
          </motion.p>
          <motion.h1 id="home-video-title" className={styles.heading} {...entrance(20, 0.8)}>
            让机器<br />理解世界
          </motion.h1>
          <motion.div className={styles.actions} {...entrance(16, 1)}>
            <Link href="/configure" className={styles.primary}>查看配置</Link>
            <Link href="/solutions" className={styles.secondary}>解决方案</Link>
          </motion.div>
        </div>
        <motion.ul className={styles.tags} aria-label="ONE-G 产品与能力" {...entrance(16, 1)}>
          <li>RobotDock</li><li>SONIC Link</li><li>深度定制</li>
        </motion.ul>
      </motion.div>
    </section>
  );
}
