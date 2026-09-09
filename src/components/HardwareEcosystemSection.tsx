"use client";

import Image from "next/image";
import { useState, type DragEvent } from "react";
import { ArrowRight, Box, Check, Cpu, Eye, Hand, Plus, X } from "lucide-react";
import { getCoreProduct } from "@/lib/products";
import { getConfiguratorHardware, getConfiguratorPerception, getConfiguratorCapabilities, isNodeSelected, updateAssembly, type AssemblyNode } from "@/lib/assembly";
import type { RobotConfiguration } from "@/types/configuration";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import styles from "./HardwareEcosystemSection.module.css";

const hardware = getConfiguratorHardware();
const perception = getConfiguratorPerception();
const capabilities = getConfiguratorCapabilities();
const nodes = [...hardware, ...perception, ...capabilities];
const core = getCoreProduct();
const dragType = "application/x-one-g-module";
const icons = { base: Box, arm: Box, hand: Hand, vision: Eye, capability: Cpu };

export default function HardwareEcosystemSection() {
  const [configuration, setConfiguration] = useState<RobotConfiguration>({ baseRobotId: core?.id ?? null, armId: null, handId: null, visionIds: [], capabilityIds: [] });
  const [dragging, setDragging] = useState<string | null>(null);
  const [overCanvas, setOverCanvas] = useState(false);
  const selected = nodes.filter(node => isNodeSelected(configuration, node));
  const installed = selected.filter(node => node.category !== "base");
  const toggle = (node: AssemblyNode) => setConfiguration(current => updateAssembly(current, node, isNodeSelected(current, node)));
  const remove = (node: AssemblyNode) => setConfiguration(current => updateAssembly(current, node, true));
  const drop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const node = nodes.find(node => node.id === event.dataTransfer.getData(dragType));
    if (node) setConfiguration(current => updateAssembly(current, node));
    setOverCanvas(false); setDragging(null);
  };

  function renderNode(node: AssemblyNode) {
    const active = isNodeSelected(configuration, node);
    const Icon = icons[node.category];
    return (
      <button key={node.id} type="button" data-node-id={node.id} aria-pressed={active} aria-label={`${active ? "取消" : "添加"} ${node.name}`} className={`${styles.node} ${active ? styles.selected : ""} ${node.category === "capability" ? styles.capability : ""}`} onClick={() => toggle(node)} draggable onDragStart={event => { event.dataTransfer.setData(dragType, node.id); event.dataTransfer.effectAllowed = "copy"; setDragging(node.id); }} onDragEnd={() => { setDragging(null); setOverCanvas(false); }}>
        <span className={styles.thumbnail}>{node.image ? <Image src={node.image} alt="" fill sizes="(max-width: 1279px) 40px, 64px" className={styles.thumbnailImage} /> : <Icon size={21} strokeWidth={1.2} aria-hidden="true" />}</span>
        <span className={styles.nodeCopy}><span className={styles.nodeType}>{node.label}</span><span className={styles.nodeName}>{node.name}</span></span>
        <span className={styles.addState}>{active ? <Check size={16} /> : <Plus size={16} />}<span>{active ? "已添加" : "添加"}</span></span>
      </button>
    );
  }

  return (
    <section id="hardware-ecosystem" className={styles.section} aria-labelledby="ecosystem-title">
      <div className={styles.container}>
        <header className={styles.heading}>
          <p className={styles.eyebrow}>03 / HARDWARE ECOSYSTEM</p>
          <h2 id="ecosystem-title" className={styles.title}>BUILD YOUR <span>ONE-G</span></h2>
          <p className={styles.intro}>像搭积木一样组合你的机器人</p>
        </header>

        <div className={styles.workbench}>
          <aside className={`${styles.library} ${styles.hardware}`} aria-label="执行硬件模块">
            <h3 className={styles.libraryTitle}>HARDWARE</h3>
            <div className={styles.nodeList}>{hardware.map(renderNode)}</div>
          </aside>

          <div className={`${styles.canvas} ${dragging ? styles.dropReady : ""} ${overCanvas ? styles.dropHover : ""}`} aria-label="机器人装配画布" onDragOver={event => { if (event.dataTransfer.types.includes(dragType)) { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; setOverCanvas(true); } }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOverCanvas(false); }} onDrop={drop}>
            <div className={styles.canvasTop}><span>ROBOT CANVAS</span><span className={styles.statusDot} aria-hidden="true" /></div>
            <div className={styles.robotVisual}>
              {core?.images[0] && <Image src={core.images[0]} alt={core.showcase?.imageAlt ?? core.name} fill sizes="(max-width: 767px) 100vw, 52vw" className={styles.robotImage} />}
              <div className={styles.connections}>
                {installed.map(node => <button type="button" key={node.id} className={styles.connectionNode} onClick={() => remove(node)} aria-label={`移除 ${node.name}`}><span>{node.label}</span><span>{node.name}</span><X size={12} aria-hidden="true" /></button>)}
              </div>
            </div>
            <div className={styles.canvasBottom}><strong>{configuration.baseRobotId ? core?.name : "选择基础平台"}</strong><span>{overCanvas ? "松开以添加模块" : "点击模块添加 · 拖入画布装配"}</span></div>
          </div>

          <aside className={`${styles.library} ${styles.perception}`} aria-label="感知与功能模块">
            <h3 className={styles.libraryTitle}>PERCEPTION / CAPABILITY</h3>
            <div className={styles.nodeList}><div className={styles.nodeGroup} aria-label="感知硬件">{perception.map(renderNode)}</div><div className={`${styles.nodeGroup} ${styles.capabilityGroup}`} aria-label="功能能力">{capabilities.map(renderNode)}</div></div>
          </aside>
        </div>

        <div className={styles.summary} aria-live="polite" aria-atomic="true">
          <p className={styles.eyebrow}>CURRENT BUILD</p>
          <p className={styles.summaryText}>{selected.length ? selected.map(node => node.name).join(" / ") : "选择模块，开始组合"}</p>
        </div>
        <div className={styles.cta}><ShimmerButton href="/customize" className="min-h-14 px-8">开始完整在线定制 <ArrowRight size={17} aria-hidden="true" /></ShimmerButton></div>
      </div>
    </section>
  );
}
