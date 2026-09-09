"use client";

import { useEffect, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { Box, Check, Cpu, Eye, Hand, Plus, X } from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { getConfigurationRows, getConfigurationTotal, getInitialConfiguration } from "@/lib/configurator";
import { readSavedConfiguration, saveConfiguration } from "@/lib/cart";
import { formatPrice } from "@/lib/pricing";
import { changeModule, getAvailability, getWorkbenchGroups, isInstalled } from "@/lib/workbench";
import type { ConfigurationCategory, ConfigurationOption, RobotConfiguration } from "@/types/configuration";
import styles from "./workbench.module.css";

const groups = getWorkbenchGroups();
const options = groups.flatMap(group => group.options);
const icons = { base: Box, arm: Box, hand: Hand, vision: Eye, capability: Cpu };
const groupNames = { base: "BASE", arm: "ARM", hand: "HAND", vision: "PERCEPTION", capability: "CAPABILITY" };
const slotNames = { base: "基础平台", arm: "机械臂插槽", hand: "灵巧手 / 执行器插槽", vision: "视觉系统", capability: "功能能力" };
const dragType = "application/x-one-g-configuration-option";
const emptyConfiguration: RobotConfiguration = { baseRobotId: null, armId: null, handId: null, visionIds: [], capabilityIds: [] };

export default function CustomizePage() {
  const router = useRouter();
  const [configuration, setConfiguration] = useState<RobotConfiguration>(getInitialConfiguration);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropHover, setDropHover] = useState<ConfigurationCategory | null>(null);
  const [allowDrag, setAllowDrag] = useState(false);
  const selected = options.filter(option => isInstalled(configuration, option));
  const invalid = selected.filter(option => !getAvailability(option, configuration).available);
  const total = getConfigurationTotal(configuration);
  const rows = getConfigurationRows(configuration);
  const canSave = ready && !!configuration.baseRobotId && invalid.length === 0;
  const draggedOption = options.find(option => option.id === draggedId);

  useEffect(() => {
    let active = true;
    readSavedConfiguration().then(saved => {
      if (!active) return;
      if (saved) setConfiguration(saved);
      setReady(true);
    });
    const media = window.matchMedia("(min-width: 768px) and (pointer: fine)");
    const updateDrag = () => setAllowDrag(media.matches);
    updateDrag();
    media.addEventListener("change", updateDrag);
    return () => { active = false; media.removeEventListener("change", updateDrag); };
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
  const accepts = (option: ConfigurationOption | undefined, category: ConfigurationCategory) =>
    ready && allowDrag && !!option && option.category === category && getAvailability(option, configuration).available;
  const drop = (event: DragEvent<HTMLElement>, category: ConfigurationCategory) => {
    event.preventDefault();
    const option = options.find(option => option.id === event.dataTransfer.getData(dragType));
    if (option && accepts(option, category)) update(option, "add");
    setDropHover(null);
    setDraggedId(null);
  };

  const library = (category: ConfigurationCategory, title = groupNames[category], label?: string, filter: (option: ConfigurationOption) => boolean = () => true) => {
    const group = groups.find(group => group.category === category)!;
    return <section className={styles.libraryGroup} aria-label={label ?? group.name}>
      <h3>{title}<span>{label ?? group.name}</span></h3>
      <div className={styles.optionList}>
        {group.options.filter(filter).map(option => {
          const active = isInstalled(configuration, option);
          const availability = getAvailability(option, configuration);
          const Icon = icons[option.category];
          return <button type="button" key={option.id} data-option-id={option.id} aria-pressed={active} aria-label={`${active ? "移除" : "添加"} ${option.name}`} disabled={!ready || (!active && !availability.available)} className={`${styles.node} ${active ? styles.selected : ""}`} title={`${option.name}${option.description ? ` — ${option.description}` : ""} · ${availability.label}`} onClick={() => update(option, "toggle")} draggable={allowDrag && ready && availability.available} onDragStart={event => { event.dataTransfer.setData(dragType, option.id); event.dataTransfer.effectAllowed = "copy"; setDraggedId(option.id); }} onDragEnd={() => { setDraggedId(null); setDropHover(null); }}>
            <Icon size={18} strokeWidth={1.2} aria-hidden="true" />
            <span className={styles.nodeCopy}><strong>{option.name}</strong><span>{availability.available ? formatPrice(option.price) : availability.label}</span></span>
            {active ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
          </button>;
        })}
      </div>
    </section>;
  };

  const slot = (category: ConfigurationCategory) => {
    const installed = selected.filter(option => option.category === category);
    const multiple = category === "vision" || category === "capability";
    const optedOut = installed.some(option => option.id === "no-arm" || option.id === "no-hand");
    const filled = installed.length > 0 && !optedOut;
    const unavailable = installed.some(option => !getAvailability(option, configuration).available);
    const canDrop = accepts(draggedOption, category);
    return <section key={category} data-slot-type={category} data-filled={filled} className={`${styles.slot} ${category === "base" ? styles.baseSlot : ""} ${filled ? styles.slotActive : ""} ${canDrop ? styles.dropReady : ""} ${dropHover === category ? styles.dropHover : ""}`} aria-label={slotNames[category]} onDragOver={event => {
      if (canDrop && event.dataTransfer.types.includes(dragType)) {
        event.preventDefault(); event.dataTransfer.dropEffect = "copy"; setDropHover(category);
      } else { event.dataTransfer.dropEffect = "none"; }
    }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropHover(current => current === category ? null : current); }} onDrop={event => drop(event, category)}>
      <div className={styles.slotHeading}><h3>{category === "base" ? "BASE PLATFORM" : category === "arm" || category === "hand" ? `${groupNames[category]} SLOT` : groupNames[category]}</h3>{filled && <Check size={15} aria-hidden="true" />}</div>
      <p className={styles.slotLabel}>{slotNames[category]}</p>
      {multiple && installed.length > 0 ? <><div className={styles.chips}>{installed.map(option => <span key={option.id} className={styles.chip}>{option.name}<button type="button" disabled={!ready} aria-label={`从插槽移除 ${option.name}`} onClick={() => update(option, "remove")}><X size={14} aria-hidden="true" /></button></span>)}</div><p className={styles.addMore}>＋ 可继续添加</p></> : installed.length > 0 ? <div className={styles.installedModule}><h4>{installed[0].name}</h4>{installed[0].description && <p>{installed[0].description}</p>}<div className={styles.installedActions}><span>{optedOut ? "已设为不安装" : unavailable ? "当前模块不可用" : category === "base" ? "✓ 已选择基础平台" : "✓ 已安装"}</span><button type="button" disabled={!ready} aria-label={`从插槽移除 ${installed[0].name}`} onClick={() => update(installed[0], "remove")}><X size={13} aria-hidden="true" />移除</button></div></div> : <div className={styles.emptySlot}><Plus size={20} strokeWidth={1} aria-hidden="true" /><p>{allowDrag ? "将模块拖到这里" : "点击部件库中的 ＋ 添加"}</p><span>{allowDrag ? `或点击${category === "vision" || category === "capability" ? "右" : "左"}侧“添加”` : category === "base" ? "从上方选择基础型号" : "从下方选择对应模块"}</span></div>}
      {dropHover === category && <div className={styles.dropMessage}>释放以添加{slotNames[category].replace("插槽", "")}</div>}
    </section>;
  };

  return <div className={styles.page}>
    <header className={styles.heading}><div><p>ONE-G / CONFIGURATOR</p><h1>CONFIGURE YOUR <span>ONE-G</span></h1></div><div className={styles.headingPrice}><span>当前预估价格</span><strong>{ready ? formatPrice(total) : "正在读取…"}</strong></div></header>
    <div className={styles.workspace}>
      <div className={styles.hardwareTitle}><h2>HARDWARE</h2><p>硬件部件库</p></div>
      <div className={styles.baseLibrary}>{library("base")}</div>
      <div className={styles.hardwareLibrary}>{library("arm")}{library("hand", "HAND", "灵巧手", option => option.id !== "gripper")}{library("hand", "GRIPPER", "夹爪 / 其他执行器", option => option.id === "gripper")}<p className={styles.libraryNote}>夹爪与灵巧手共用 HAND 插槽，选择后互相替换。</p></div>
      <section className={styles.currentBuild} aria-label="当前配置结构" aria-busy={!ready}>
        <header className={styles.buildHeading}><div><h2>CURRENT BUILD</h2><p>当前配置结构</p></div><span className={styles.buildStatus} role="status">{!ready ? "读取中…" : canSave ? "✓ 配置已就绪" : "Incomplete"}</span></header>
        <p className={styles.buildHint}>{!ready ? "正在读取已保存方案…" : !configuration.baseRobotId ? "还需要选择基础平台" : invalid.length ? "请移除不可用模块后保存" : "基础平台已选择，可继续添加选配模块"}</p>
        <div className={styles.slots}>{groups.map(group => slot(group.category))}</div>
      </section>
      <aside className={styles.rightLibrary} aria-label="感知系统与功能能力">{library("vision", "PERCEPTION", "感知系统")}{library("capability", "CAPABILITY", "功能能力")}</aside>
      <section className={styles.summary} aria-label="自动生成的配置清单" aria-live="polite" aria-atomic="true"><h2>BUILD SHEET <span>当前配置清单</span></h2><dl>{rows.map(row => <div key={row.label}><dt>{row.label}</dt><dd>{ready ? row.value : "读取中…"}</dd></div>)}</dl></section>
      <div className={styles.checkoutBar}>
        <div className={styles.buildRecap}><span>CURRENT BUILD</span><p>{ready ? selected.map(option => option.name).join(" / ") || "尚未添加模块" : "正在读取…"}</p></div>
        <div className={styles.price}><span>TOTAL / 预估总价</span><strong data-testid="configuration-total">{ready ? formatPrice(total) : "正在读取…"}</strong><small>演示价格，仅用于原型展示</small></div>
        <div className={styles.actions}><button type="button" className={styles.clear} disabled={!ready} onClick={() => { setConfiguration({ ...emptyConfiguration, visionIds: [], capabilityIds: [] }); setNotice("已清空当前编辑配置；保存后更新本地方案。"); }}>清空配置</button><button type="button" className={styles.save} disabled={!canSave} onClick={() => save()}>保存方案</button><ShimmerButton type="button" disabled={!canSave} onClick={() => save(true)}>加入购物车</ShimmerButton></div>
        <div className={styles.feedback}><span>兼容规则待正式产品确认</span><p role="status">{notice}</p></div>
      </div>
    </div>
  </div>;
}
