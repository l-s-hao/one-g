"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { solutions, solutionCategories } from "@/data/solutions";
import { getProductById } from "@/lib/products";
import styles from "@/app/solutions/solutions.module.css";
export default function SolutionExplorer() {
  const [category, setCategory] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const visible = solutions.filter(item => category === "all" || item.category === category);
  return <>
    <div className={styles.filters} role="group" aria-label="解决方案分类">{solutionCategories.map(item=><button key={item.id} type="button" aria-pressed={category===item.id} onClick={()=>{setCategory(item.id);setExpanded(null);}}>{item.name}</button>)}</div>
    <div className={styles.grid} aria-label="精选解决方案">{visible.map(item=><article className={styles.card} id={item.id} key={item.id}>
      <figure><Image src={item.media.src} alt={item.media.alt} width={item.media.width} height={item.media.height} sizes="(max-width:767px) 100vw, 50vw"/><figcaption>{item.media.caption}</figcaption></figure>
      <p className={styles.eyebrow}>{solutionCategories.find(c=>c.id===item.category)?.name}</p><h2>{item.name}</h2>
      <p><strong>问题：</strong>{item.problem}</p><p><strong>方案：</strong>{item.description}</p>
      <p className={styles.related}>相关系统：{item.productIds.map(id=>getProductById(id)?.name).join(" · ")}</p>
      <button type="button" className={styles.expand} aria-expanded={expanded===item.id} aria-controls={`solution-${item.id}`} onClick={()=>setExpanded(expanded===item.id?null:item.id)}>{expanded===item.id?"收起方案 −":"查看方案 +"}</button>
      <div id={`solution-${item.id}`} hidden={expanded!==item.id} className={styles.detail}>
        <dl><div><dt>适用任务</dt><dd>{item.subtitle}</dd></div><div><dt>ONE-G 如何实现</dt><dd>{item.capabilities[0]}</dd></div><div><dt>涉及能力</dt><dd>{item.capabilities.slice(1).join(" ")}</dd></div><div><dt>适用边界</dt><dd>{item.boundary}</dd></div></dl><Link href="/configure">查看标准配置 →</Link>
      </div>
    </article>)}</div>
  </>;
}
