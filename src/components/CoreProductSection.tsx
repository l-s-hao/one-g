"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import type { Product } from "@/types/product";
import styles from "./CoreProductSection.module.css";

export default function CoreProductSection({ product }: { product: Product }) {
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
    <section id="core-product" ref={sectionRef} className={styles.section} aria-labelledby="core-product-title">
      <div className={`home-content-shell ${styles.layout}`}>
        <div className={styles.heading}>
          <p className={styles.index}>02 / CORE PRODUCT</p>
          <h2 id="core-product-title" className={styles.title}>
            {(product.showcase?.titleLines ?? [product.name]).map((line, index) => <span key={index} className={index === 0 ? styles.brand : styles.model}>{line}</span>)}
          </h2>
        </div>
        <div className={styles.visual}>
          {/* Product imagery comes from the repository, including prototype placeholders. */}
          {product.images[0] && <Image
            src={product.images[0]}
            alt={product.showcase?.imageAlt ?? product.name}
            fill
            sizes="(max-width: 767px) 100vw, 62vw"
            className={styles.image}
          />}
        </div>
        <div className={styles.details}>
          <p className={styles.description}>{(product.showcase?.descriptionLines ?? [product.subtitle]).map((line, index) => <span key={index} className="block">{line}</span>)}</p>
          <div className={styles.actions}>
            <Link href={`/products/${product.slug}`} className={styles.secondary}>了解产品</Link>
            <ShimmerButton href="/customize/start" className="min-h-12 min-w-32 px-6">在线定制</ShimmerButton>
          </div>
        </div>
      </div>
    </section>
  );
}
