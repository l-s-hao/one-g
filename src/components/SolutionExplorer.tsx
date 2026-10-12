"use client";

import { LArticle, LButton, LDd, LDiv, LDl, LDt, LFigcaption, LFigure, LH2, LP, LStrong } from "@/i18n/Elements";

import { LocalizedLink as Link } from "@/i18n/Elements";
import { LocalizedImage as Image } from "@/i18n/Elements";
import { useEffect, useState } from "react";
import { solutions, solutionCategories } from "@/data/solutions";
import { getProductById } from "@/lib/products";
import CardHover from "./CardHover";
import styles from "@/app/solutions/solutions.module.css";
export default function SolutionExplorer() {
  const [category, setCategory] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    let frame = 0;
    const reveal = (hash: string) => {
      const id = hash.slice(1);
      if (!solutions.some(item => item.id === id)) return;
      void Promise.resolve().then(() => {
        if (!active) return;
        setCategory("all"); setExpanded(id);
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
      });
    };
    const sync = () => reveal(window.location.hash);
    const link = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest("a") : null;
      if (!anchor || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      const url = new URL(anchor.href);
      if (url.origin === location.origin && url.pathname.replace(/\/+$/, "") === location.pathname.replace(/\/+$/, "")) reveal(url.hash);
    };
    sync();
    window.addEventListener("hashchange", sync);
    document.addEventListener("click", link);
    return () => { active = false; cancelAnimationFrame(frame); window.removeEventListener("hashchange", sync); document.removeEventListener("click", link); };
  }, []);
  const visible = solutions.filter(item => category === "all" || item.category === category);
  return <>
    <LDiv className={styles.filters} role="group" aria-label="解决方案分类">{solutionCategories.map(item=><LButton key={item.id} type="button" aria-pressed={category===item.id} onClick={()=>{setCategory(item.id);setExpanded(null);}}>{item.name}</LButton>)}</LDiv>
    <LDiv className={styles.grid} aria-label="精选解决方案">{visible.map(item=><CardHover key={item.id}><LArticle data-card-hover-surface className={styles.card} id={item.id}>
      <LFigure><Image src={item.media.src} alt={item.media.alt} width={item.media.width} height={item.media.height} sizes="(max-width:767px) 100vw, 50vw"/><LFigcaption>{item.media.caption}</LFigcaption></LFigure>
      <LP className={styles.eyebrow}>{solutionCategories.find(c=>c.id===item.category)?.name}</LP><LH2>{item.name}</LH2>
      <LP><LStrong>问题：</LStrong>{item.problem}</LP><LP><LStrong>方案：</LStrong>{item.description}</LP>
      <LP className={styles.related}>相关系统：{[...item.productIds.map(id=>getProductById(id)?.name), item.content?.name].filter(Boolean).join(" · ")}</LP>
      {item.detailHref ? <Link intent="ordinary" className={styles.expand} href={item.detailHref}>查看方案 →</Link> : <LButton intent="ordinary" type="button" className={styles.expand} aria-expanded={expanded===item.id} aria-controls={`solution-${item.id}`} onClick={()=>setExpanded(expanded===item.id?null:item.id)}>{expanded===item.id?"收起方案 −":"查看方案 +"}</LButton>}

      <LDiv id={`solution-${item.id}`} hidden={expanded!==item.id} className={styles.detail}>
        <LDl><LDiv><LDt>适用任务</LDt><LDd>{item.subtitle}</LDd></LDiv><LDiv><LDt>ONE-G 如何实现</LDt><LDd>{item.capabilities[0]}</LDd></LDiv><LDiv><LDt>涉及能力</LDt><LDd>{item.capabilities.slice(1).join(" ")}</LDd></LDiv><LDiv><LDt>适用边界</LDt><LDd>{item.boundary}</LDd></LDiv></LDl>
      </LDiv>
    </LArticle></CardHover>)}</LDiv>
  </>;
}
