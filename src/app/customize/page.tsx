"use client";

import Image from "next/image";
import { useEffect, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { Box, Check, Cpu, Eye, Hand, Plus, X } from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { getConfigurationTotal, getInitialConfiguration } from "@/lib/configurator";
import { readSavedConfiguration, saveConfiguration } from "@/lib/cart";
import { formatPrice } from "@/lib/pricing";
import { changeModule, getAvailability, getWorkbenchGroups, getWorkbenchPreview, isInstalled } from "@/lib/workbench";
import type { ConfigurationOption, RobotConfiguration } from "@/types/configuration";
import styles from "./workbench.module.css";

const groups = getWorkbenchGroups();
const options = groups.flatMap(group => group.options);
const icons = { base: Box, arm: Box, hand: Hand, vision: Eye, capability: Cpu };
const groupNames = { base: "BASE", arm: "ARM", hand: "HAND", vision: "PERCEPTION", capability: "CAPABILITY" };
const dragType = "application/x-one-g-configuration-option";
const emptyConfiguration: RobotConfiguration = { baseRobotId: null, armId: null, handId: null, visionIds: [], capabilityIds: [] };

export default function CustomizePage() {
  const router = useRouter();
  const [configuration, setConfiguration] = useState<RobotConfiguration>(getInitialConfiguration);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [dragging, setDragging] = useState(false);
  const [dropHover, setDropHover] = useState(false);
  const selected = options.filter(option => isInstalled(configuration, option));
  const invalid = selected.filter(option => !getAvailability(option, configuration).available);
  const preview = getWorkbenchPreview(configuration.baseRobotId);
  const total = getConfigurationTotal(configuration);
  const canSave = ready && !!configuration.baseRobotId && invalid.length === 0;

  useEffect(() => {
    let active = true;
    readSavedConfiguration().then(saved => {
      if (!active) return;
      if (saved) setConfiguration(saved);
      setReady(true);
    });
    return () => { active = false; };
  }, []);

  const update = (option: ConfigurationOption, mode: "toggle" | "add" | "remove") => {
    if (!ready) return;
    setNotice("");
    setConfiguration(current => {
      const remove = mode === "remove" || (mode === "toggle" && isInstalled(current, option));
      if (!remove && !getAvailability(option, current).available) return current;
      return changeModule(current, option, remove);
    });
  };
  const save = (toCart = false) => {
    if (!canSave) return;
    try {
      saveConfiguration(configuration);
      setNotice("方案已保存到当前浏览器。");
      if (toCart) router.push("/cart");
    } catch { setNotice("无法保存，请检查浏览器存储设置后重试。"); }
  };
  const drop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const option = options.find(option => option.id === event.dataTransfer.getData(dragType));
    if (option) update(option, "add");
    setDropHover(false); setDragging(false);
  };

  return (
    <div className={styles.page}>
      <header className={styles.heading}><p>ONE-G / CONFIGURATOR</p><h1>CONFIGURE YOUR <span>ONE-G</span></h1></header>
      <div className={styles.workspace}>
        <div className={styles.hardwareTitle}>HARDWARE</div>
        {groups.map(group => (
          <section key={group.category} className={`${styles.libraryGroup} ${styles[group.category]}`} aria-label={group.name}>
            <h2>{groupNames[group.category]} <span>{group.name}</span></h2>
            <div className={styles.optionList}>
              {group.options.map(option => {
                const active = isInstalled(configuration, option);
                const availability = getAvailability(option, configuration);
                const Icon = icons[option.category];
                return <button type="button" key={option.id} data-option-id={option.id} aria-pressed={active} aria-label={`${active ? "移除" : "添加"} ${option.name}`} disabled={!ready || (!active && !availability.available)} className={`${styles.node} ${active ? styles.selected : ""} ${option.category === "capability" ? styles.software : ""}`} title={`${option.name} · ${group.name}${option.description ? ` — ${option.description}` : ""} · ${availability.label}`} onClick={() => update(option, "toggle")} draggable={ready && availability.available} onDragStart={event => { event.dataTransfer.setData(dragType, option.id); event.dataTransfer.effectAllowed = "copy"; setDragging(true); }} onDragEnd={() => { setDragging(false); setDropHover(false); }}>
                  <Icon size={20} strokeWidth={1.2} aria-hidden="true" />
                  <span className={styles.nodeCopy}><strong>{option.name}</strong><span>{availability.available ? formatPrice(option.price) : availability.label}</span></span>
                  {active ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
                </button>;
              })}
            </div>
          </section>
        ))}

        <div className={`${styles.canvas} ${dragging ? styles.dropReady : ""} ${dropHover ? styles.dropHover : ""}`} aria-label="Robot Canvas" onDragOver={event => { if (event.dataTransfer.types.includes(dragType)) { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; setDropHover(true); } }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropHover(false); }} onDrop={drop}>
          <div className={styles.canvasHeading}><span>ROBOT CANVAS</span><span>{dropHover ? "DROP TO ADD" : "点击模块 / 拖入装配"}</span></div>
          <div className={styles.robotVisual}>
            {preview.image && <Image src={preview.image} alt={preview.imageAlt} fill sizes="(max-width: 767px) 100vw, 52vw" className={styles.robotImage} />}
            <div className={styles.tags}>{selected.filter(option => option.category !== "base").map(option => <button key={option.id} type="button" className={styles.tag} aria-label={`从画布移除 ${option.name}`} onClick={() => update(option, "remove")}><span>{groupNames[option.category]}</span>{option.name}<X size={12} aria-hidden="true" /></button>)}</div>
            {dropHover && <div className={styles.dropMessage}>添加到 ONE-G</div>}
          </div>
          <div className={styles.robotCaption}><h2>{preview.name}</h2><p>{preview.placeholder ? "产品图为装配示意，非实时组合渲染" : "完整机器人预览"}</p></div>
        </div>

        <div className={styles.buildPanel}>
        <div className={styles.summary} aria-live="polite" aria-atomic="true"><h2>CURRENT BUILD</h2><p>{ready ? selected.map(option => option.name).join(" / ") || "尚未添加模块" : "正在读取已保存方案…"}</p></div>
        <div className={styles.checkoutBar}>
          <div className={styles.price}><span>当前方案</span><strong data-testid="configuration-total">{ready ? formatPrice(total) : "正在读取…"}</strong><small>演示价格，仅用于原型展示</small></div>
          <div className={styles.feedback}><p>{!configuration.baseRobotId ? "请选择一个基础平台后保存方案" : invalid.length ? "请移除不可用模块后保存" : "兼容规则待正式产品确认"}</p><p role="status">{notice}</p></div>
          <div className={styles.actions}>
            <button type="button" className={styles.clear} disabled={!ready} onClick={() => { setConfiguration({ ...emptyConfiguration, visionIds: [], capabilityIds: [] }); setNotice("已清空当前编辑配置；保存后更新本地方案。"); }}>清空配置</button>
            <button type="button" className={styles.save} disabled={!canSave} onClick={() => save()}>保存方案</button>
            <ShimmerButton type="button" disabled={!canSave} onClick={() => save(true)}>加入购物车</ShimmerButton>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
