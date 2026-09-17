"use client";
import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";

import type { Product } from "@/types/product";
import styles from "./ProductAdvertisement.module.css";

type Slide = { product: Product; anchor: string; heroImageIndex: number };
export default function ProductAdvertisement({ slides }: { slides: Slide[] }) {
  const [active, setActive] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const move = (delta: number) => setActive(index => (index + delta + slides.length) % slides.length);
  return <section className={styles.carousel} aria-label="可配置产品广告" aria-roledescription="轮播" tabIndex={0}
    onKeyDown={event => { if (event.target !== event.currentTarget) return; if (event.key === "ArrowRight") { event.preventDefault(); move(1); } if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); } }}
    onPointerDown={event => { if (event.button !== 0 || (event.target as HTMLElement).closest("a,button")) return; start.current = { x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); }}
    onPointerCancel={() => { start.current = null; }}
    onPointerUp={event => { const point = start.current; start.current = null; if (!point) return; const dx = event.clientX - point.x; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(event.clientY - point.y)) move(dx < 0 ? 1 : -1); }}>
    <div className={styles.track} style={{ transform: `translateX(-${active * 100}%)` }}>
      {slides.map(({product,anchor,heroImageIndex}, index) => {
        const note = product.detail!.imageNotes[heroImageIndex];
        return <article key={product.id} className={styles.slide} aria-label={`${index + 1} / ${slides.length} · ${product.name}`} aria-roledescription="幻灯片" aria-hidden={active !== index} inert={active !== index}>
          <div className={styles.copy}><p className={styles.eyebrow}>{index === 0 ? "ROBOT HARDWARE" : "TELEOPERATION"}</p><h1>{product.name}</h1><p>{product.subtitle}</p><div className={styles.actions}><a href={`#${anchor}`}>{index === 0 ? "了解产品" : "了解能力"}</a><Link href="/configure">查看配置 →</Link></div></div>
          <figure><Image src={product.images[heroImageIndex]} alt={note.alt} width={note.width} height={note.height} sizes="(max-width: 767px) 100vw, 60vw" loading={index === 0 ? "eager" : "lazy"} draggable={false}/><figcaption>{note.caption}</figcaption></figure>
        </article>;
      })}
    </div>
    <div className={styles.controls}><button type="button" aria-label="上一张广告" onClick={() => move(-1)}>←</button><div aria-label="广告分页">{slides.map(({product},index)=><button type="button" key={product.id} aria-label={`显示 ${product.name} 广告`} aria-current={active === index ? "true" : undefined} onClick={()=>setActive(index)}>{String(index+1).padStart(2,"0")}</button>)}</div><button type="button" aria-label="下一张广告" onClick={() => move(1)}>→</button></div>
    <p className="sr-only" aria-live="polite">当前广告：{slides[active].product.name}</p>
  </section>;
}
