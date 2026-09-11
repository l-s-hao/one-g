"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { getInitialConfiguration } from "@/lib/configurator";
import { getAvailability, isInstalled } from "@/lib/workbench";
import type { RecommendedGroup } from "@/lib/recommendations";
import type { CustomizeScene } from "@/data/customize-entry";
import type { ConfigurationOption, RobotConfiguration } from "@/types/configuration";
import styles from "./RecommendedBuild.module.css";

const categoryLabels = { base: "基础平台", arm: "机械臂", hand: "末端执行器", vision: "感知系统", capability: "功能能力" };

export default function RecommendedBuild({ scene, groups, configuration, ready, canApply, applied, onAdd, onApply }: {
  scene: CustomizeScene;
  groups: readonly RecommendedGroup[];
  configuration: RobotConfiguration;
  ready: boolean;
  canApply: boolean;
  applied: boolean;
  onAdd: (option: ConfigurationOption) => void;
  onApply: () => void;
}) {
  // SSR and the first browser render use the same configuration and viewport snapshot.
  const [initialConfiguration] = useState(getInitialConfiguration);
  const [{ mounted, mobile }, setClientState] = useState({ mounted: false, mobile: false });
  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const synchronizeClient = () => setClientState({ mounted: true, mobile: media.matches });
    synchronizeClient();
    media.addEventListener("change", synchronizeClient);
    return () => media.removeEventListener("change", synchronizeClient);
  }, []);
  const initialized = mounted && ready === true;
  const currentConfiguration = initialized ? configuration : initialConfiguration;
  const recommendationApplied = initialized && applied === true;
  const applyDisabled: boolean = !mounted || ready !== true || canApply !== true || recommendationApplied;
  const [expandedOverride, setExpandedOverride] = useState<boolean | null>(null);
  const expanded = expandedOverride ?? !mobile;
  const count = groups.reduce((sum, group) => sum + group.options.length, 0);
  return (
    <section className={styles.panel} aria-label={`${scene.name}推荐方案`}>
      <h3><button type="button" className={styles.toggle} aria-expanded={expanded} aria-controls="recommended-build-options" disabled={!mounted} onClick={() => setExpandedOverride(!expanded)}>
        <span><span className={styles.eyebrow}>RECOMMENDED BUILD</span><strong>推荐方案 · {scene.english} · {count}项</strong></span>
        <ChevronDown size={16} className={expanded ? styles.expanded : ""} aria-hidden="true" />
      </button></h3>
      <div id="recommended-build-options" hidden={!expanded}>
        <ul className={styles.list}>
          {groups.flatMap(group => group.options.map(option => {
            const installed = isInstalled(currentConfiguration, option);
            const availability = getAvailability(option, currentConfiguration);
            const buttonDisabled: boolean = !mounted || ready !== true || installed === true || availability.available === false;
            return <li key={option.id} data-recommendation-id={option.id}>
              <div><span className={styles.category}>{categoryLabels[group.category]}</span><strong>{option.name}</strong></div>
              <button type="button" disabled={buttonDisabled} aria-label={installed ? `${option.name}已添加` : `添加推荐 ${option.name}`} title={availability.available ? undefined : availability.label} onClick={() => onAdd(option)}>
                {installed ? <Check size={14} aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />}{installed ? "已添加" : "添加"}{!availability.available && <span className="color-vision-only"> × 不可用</span>}
              </button>
            </li>;
          }))}
        </ul>
        <div className={styles.actions}>
          <ShimmerButton type="button" disabled={applyDisabled} onClick={onApply}>{recommendationApplied ? "已应用推荐方案" : "应用推荐方案"}</ShimmerButton>
          <p>临时推荐，仅用于配置演示；可自由替换。</p>
        </div>
      </div>
    </section>
  );
}
