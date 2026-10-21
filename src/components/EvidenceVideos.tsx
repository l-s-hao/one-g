"use client";

import { useRef, useState } from "react";
import { LA, LButton, LDiv, LFigcaption, LFigure, LH3, LP, LSmall, LVideo } from "@/i18n/Elements";
import { solutionDemos, type SolutionDemo } from "@/data/solution-demos";
import styles from "./EvidenceVideos.module.css";

function EvidenceVideo({ demo }: { demo: SolutionDemo }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  return <LFigure className={styles.item} data-demo={demo.id}>
    <LH3>{demo.title}</LH3><LP className={styles.status}>{demo.status}</LP>
    <LVideo ref={ref} data-evidence-video controls playsInline preload="none" poster={demo.poster}
      src={demo.src} width={demo.width} height={demo.height} aria-label={demo.title}
      onError={() => setFailed(true)} onPlay={event => {
        // A second user-initiated demo pauses the first; volume remains user-controlled.
        document.querySelectorAll<HTMLVideoElement>("video[data-evidence-video]").forEach(video => {
          if (video !== event.currentTarget) video.pause();
        });
      }}>
      <LA href={demo.sourceHref}>视频无法播放时可查看来源说明。</LA>
    </LVideo>
    {failed && <LDiv role="status" className={styles.error}><LP>视频暂时无法加载，请稍后重试或查看来源说明。</LP>
      <LButton effect="invert" effectVariant="secondary" type="button" onClick={() => { setFailed(false); ref.current?.load(); }}>重试加载</LButton>
    </LDiv>}
    <LFigcaption><LP>{demo.description}</LP><LP className={styles.boundary}>{demo.boundary}</LP>
      <LSmall>{demo.credit}</LSmall><LA href={demo.sourceHref} target="_blank" rel="noopener noreferrer">{demo.sourceLabel}</LA>
    </LFigcaption>
  </LFigure>;
}

export default function EvidenceVideos({ ids }: { ids: readonly string[] }) {
  return <LDiv className={styles.grid}>{ids.map(id => {
    const demo = solutionDemos.find(item => item.id === id);
    return demo ? <EvidenceVideo key={id} demo={demo}/> : null;
  })}</LDiv>;
}
