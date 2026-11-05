"use client";

import ContentVideo from "./ContentVideo";
import { LDiv, LFigure, LH3 } from "@/i18n/Elements";
import { solutionDemos, type SolutionDemo } from "@/data/solution-demos";
import styles from "./EvidenceVideos.module.css";

function EvidenceVideo({ demo }: { demo: SolutionDemo }) {
  return <LFigure className={styles.item} data-demo={demo.id}>
    <LH3>{demo.title}</LH3>
    <ContentVideo mediaId={demo.id} src={demo.src} poster={demo.poster} label={demo.title} width={demo.width} height={demo.height}/>
  </LFigure>;
}

export default function EvidenceVideos({ ids, layout = "grid" }: { ids: readonly string[]; layout?: "grid" | "feature" }) {
  return <LDiv className={`${styles.grid} ${layout === "feature" ? styles.feature : ""}`}>{ids.map(id => {
    const demo = solutionDemos.find(item => item.id === id);
    return demo ? <EvidenceVideo key={id} demo={demo}/> : null;
  })}</LDiv>;
}
