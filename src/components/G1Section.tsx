"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import styles from "./G1Section.module.css";

export default function G1Section() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    section.dataset.reveal = "pending";
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        section.dataset.reveal = "visible";
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="g1" ref={sectionRef} className={styles.section} aria-labelledby="g1-title">
      <div className={styles.layout}>
        <div className={styles.heading}>
          <p className={styles.index}>01 / HUMANOID</p>
          <h2 id="g1-title" className={styles.title}>
            <span className={styles.brand}>ONE-G</span>
            <span className={styles.model}>G1</span>
          </h2>
        </div>
        <div className={styles.visual}>
          {/* Replace with the approved G1 render when supplied; existing full robot asset only. */}
          <Image
            src="/one-g/hero/one-g-service.png"
            alt="现有完整服务机器人渲染图，待替换为 ONE-G G1 产品图"
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1400px) 62vw, 868px"
            className={styles.image}
          />
        </div>
        <div className={styles.details}>
          <p className={styles.description}>通用具身智能<br />机器人平台</p>
          <div className={styles.actions}>
            <Link href="/products/g1" className={styles.secondary}>了解产品</Link>
            <ShimmerButton href="/customize" className="min-h-12 min-w-32 px-6">在线定制</ShimmerButton>
          </div>
        </div>
      </div>
    </section>
  );
}
