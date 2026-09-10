"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { customizeScenes, customizeScopes, getCustomizeEntry, getCustomizeQuery, type CustomizeChoice } from "@/data/customize-entry";
import { MagicBentoEffect } from "@/components/MagicBentoEffect";
import styles from "./start.module.css";

function ChoiceCard({ choice, group, selected, onSelect }: {
  choice: CustomizeChoice;
  group: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label className={styles.card} data-magic-card>
      <input type="radio" name={group} value={choice.id} checked={selected} onChange={onSelect} aria-labelledby={`${group}-${choice.id}-name`} aria-describedby={`${group}-${choice.id}-description`} />
      <span className={styles.cardBody} data-magic-surface>
        <span className={styles.cardTop}><span className={styles.english}>{choice.english}</span><span className={styles.check} aria-hidden="true">{selected && <Check size={18} />}</span></span>
        <span id={`${group}-${choice.id}-name`} className={styles.name}>{choice.name}</span>
        <span id={`${group}-${choice.id}-description`} className={styles.description}>{choice.description}</span>
      </span>
    </label>
  );
}

function EntrySelector({ initialScene, initialScope }: { initialScene?: string; initialScope?: string }) {
  const router = useRouter();
  const [sceneId, setSceneId] = useState(initialScene ?? "");
  const [scopeId, setScopeId] = useState(initialScene ? initialScope ?? "" : "");
  const { scene, scope } = getCustomizeEntry(sceneId, scopeId);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.heading}>
          <p className={styles.eyebrow}>ONE-G / CUSTOM BUILD</p>
          <h1>START YOUR BUILD</h1>
          <p className={styles.subtitle}>选择你的 ONE-G 定制方向</p>
        </header>
        <fieldset className={styles.step}>
          <legend><span className={styles.eyebrow}>STEP 01</span><span className={styles.question}>你希望 ONE-G 做什么？</span></legend>
          <MagicBentoEffect className={styles.scenes} textAutoHide enableStars enableSpotlight enableBorderGlow enableTilt enableMagnetism clickEffect={false} spotlightRadius={420} particleCount={12} glowColor="var(--effect-rgb)">{customizeScenes.map(choice => <ChoiceCard key={choice.id} choice={choice} group="scene" selected={sceneId === choice.id} onSelect={() => setSceneId(choice.id)} />)}</MagicBentoEffect>
        </fieldset>
        <fieldset className={styles.step} disabled={!scene} aria-describedby="scope-hint">
          <legend><span className={styles.eyebrow}>STEP 02</span><span className={styles.question}>你希望定制什么？</span></legend>
          <p id="scope-hint" className={styles.hint} aria-live="polite">{scene ? "选择定制范围，进入你的工作台。" : "先选择使用场景，即可选择定制范围。"}</p>
          <MagicBentoEffect className={styles.scopes} textAutoHide enableStars enableSpotlight enableBorderGlow enableTilt enableMagnetism clickEffect={false} spotlightRadius={420} particleCount={12} glowColor="var(--effect-rgb)">{customizeScopes.map(choice => <ChoiceCard key={choice.id} choice={choice} group="scope" selected={scopeId === choice.id} onSelect={() => setScopeId(choice.id)} />)}</MagicBentoEffect>
        </fieldset>
        <section className={styles.summary} aria-labelledby="build-summary-title">
          <div>
            <h2 id="build-summary-title" className={styles.eyebrow}>YOUR BUILD</h2>
            <p className={styles.selection} aria-live="polite"><span>{scene?.name ?? "选择场景"}</span><span className={styles.separator}>/</span><span>{scope?.name ?? "选择范围"}</span></p>
          </div>
          <ShimmerButton type="button" disabled={!scene || !scope} className={styles.startButton} onClick={() => {
            if (scene && scope) router.push(`/customize${getCustomizeQuery(scene, scope)}`);
          }}>开始配置 ONE-G <ArrowRight size={18} aria-hidden="true" /></ShimmerButton>
        </section>
      </div>
    </main>
  );
}

function EntryFromSearch() {
  const params = useSearchParams();
  const { scene, scope } = getCustomizeEntry(params.get("scene"), params.get("scope"));
  return <EntrySelector key={`${scene?.id ?? ""}/${scope?.id ?? ""}`} initialScene={scene?.id} initialScope={scope?.id} />;
}

export default function CustomizeStartPage() {
  return <Suspense fallback={<main className={styles.page}><p role="status">正在加载定制方向…</p></main>}><EntryFromSearch /></Suspense>;
}
