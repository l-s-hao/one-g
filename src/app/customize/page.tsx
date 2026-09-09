"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { Box, Check, ChevronDown, Cpu, Eye, Hand, Plus, X } from "lucide-react";
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
const groupNames = { base: "BASE PLATFORM", arm: "ARM", hand: "END EFFECTOR", vision: "PERCEPTION", capability: "CAPABILITY" };
const categoryNames = { base: "基础平台", arm: "机械臂", hand: "末端执行器", vision: "视觉系统", capability: "功能能力" };
const progressNames = { base: "BASE", arm: "ARM", hand: "END EFFECTOR", vision: "PERCEPTION", capability: "CAPABILITY" };
const isOmitted = (option: ConfigurationOption) => option.id === "no-arm" || option.id === "no-hand";
const slotNames = { base: "基础平台", arm: "机械臂插槽", hand: "末端执行器插槽", vision: "视觉系统", capability: "功能能力" };
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
  const [openCategory, setOpenCategory] = useState<ConfigurationCategory | null>("base");
  const libraryScrollRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Partial<Record<ConfigurationCategory, HTMLButtonElement>>>({});
  const [navigation, setNavigation] = useState<{ category: ConfigurationCategory } | null>(null);
  const [slotFeedback, setSlotFeedback] = useState<{ category: ConfigurationCategory } | null>(null);

  useEffect(() => {
    if (!navigation) return;
    // Wait for the controlled accordion to finish rendering before measuring it.
    const frame = requestAnimationFrame(() => {
      const target = categoryRefs.current[navigation.category];
      const container = libraryScrollRef.current;
      if (!target || !container) return;
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
      if (window.matchMedia("(min-width: 768px)").matches) {
        // scrollIntoView would also move page ancestors; scroll only the library.
        const top = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
        container.scrollTo({ top, behavior });
      } else {
        target.scrollIntoView({ behavior, block: "start" });
      }
    });
    const timer = window.setTimeout(() => setNavigation(null), 1800);
    return () => { cancelAnimationFrame(frame); window.clearTimeout(timer); };
  }, [navigation]);

  useEffect(() => {
    if (!slotFeedback) return;
    const timer = window.setTimeout(() => setSlotFeedback(null), 1500);
    return () => window.clearTimeout(timer);
  }, [slotFeedback]);

  const navigateToCategory = (category: ConfigurationCategory) => {
    setOpenCategory(category);
    setNavigation({ category });
  };

  const selected = options.filter(option => isInstalled(configuration, option));
  const invalid = selected.filter(option => !getAvailability(option, configuration).available);
  const total = getConfigurationTotal(configuration);
  const rows = getConfigurationRows(configuration);
  const canSave = ready && !!configuration.baseRobotId && invalid.length === 0;
  const draggedOption = options.find(option => option.id === draggedId);
  const dimensions = groups.map(group => ({
    category: group.category,
    complete: selected.some(option => option.category === group.category && !isOmitted(option) && getAvailability(option, configuration).available),
  }));
  const completedCount = dimensions.filter(dimension => dimension.complete).length;
  const completion = Math.round(completedCount / dimensions.length * 100);

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
    if (mode === "remove" || isInstalled(configuration, option) || getAvailability(option, configuration).available) {
      setSlotFeedback({ category: option.category });
    }
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

  const library = (group: (typeof groups)[number], index: number) => {
    const expanded = openCategory === group.category;
    return (
      <section key={group.category} className={styles.libraryGroup}>
        <h3>
          <button
            type="button"
            id={`category-${group.category}`}
            data-category={group.category}
            ref={element => { categoryRefs.current[group.category] = element ?? undefined; }}
            className={`${styles.categoryToggle} ${navigation?.category === group.category ? styles.categoryLocated : ""}`}
            aria-expanded={expanded}
            aria-controls={`options-${group.category}`}
            onClick={() => setOpenCategory(expanded ? null : group.category)}
          >
            <span className={styles.categoryNumber}>{String(index + 1).padStart(2, "0")}</span>
            <span className={styles.categoryCopy}>
              <strong>{groupNames[group.category]}</strong>
              <span>{categoryNames[group.category]}</span>
            </span>
            <ChevronDown size={16} className={expanded ? styles.expanded : ""} aria-hidden="true" />
          </button>
        </h3>
        <div id={`options-${group.category}`} role="region" aria-labelledby={`category-${group.category}`} hidden={!expanded}>
          <div className={styles.optionList}>
            {group.options.map(option => {
              const active = isInstalled(configuration, option);
              const availability = getAvailability(option, configuration);
              const Icon = icons[option.category];
              return (
                <button
                  type="button"
                  key={option.id}
                  data-option-id={option.id}
                  aria-pressed={active}
                  aria-label={`${active ? "移除" : "添加"} ${option.name}`}
                  disabled={!ready || (!active && !availability.available)}
                  className={`${styles.node} ${active ? styles.selected : ""}`}
                  title={`${option.name}${option.description ? ` — ${option.description}` : ""} · ${availability.label}`}
                  onClick={() => update(option, "toggle")}
                  draggable={allowDrag && ready && availability.available}
                  onDragStart={event => {
                    event.dataTransfer.setData(dragType, option.id);
                    event.dataTransfer.effectAllowed = "copy";
                    setDraggedId(option.id);
                  }}
                  onDragEnd={() => { setDraggedId(null); setDropHover(null); }}
                >
                  <Icon size={18} strokeWidth={1.2} aria-hidden="true" />
                  <span className={styles.nodeCopy}>
                    <strong>{option.name}</strong>
                    <span>{availability.available ? formatPrice(option.price) : availability.label}</span>
                  </span>
                  {active ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
                </button>
              );
            })}
          </div>
          {group.category === "hand" && <p className={styles.libraryNote}>灵巧手与夹爪共用一个插槽，选择后互相替换。</p>}
        </div>
      </section>
    );
  };

  const slot = (category: ConfigurationCategory) => {
    const installed = selected.filter(option => option.category === category);
    const multiple = category === "vision" || category === "capability";
    const optedOut = installed.some(isOmitted);
    const filled = installed.length > 0 && !optedOut;
    const unavailable = installed.some(option => !getAvailability(option, configuration).available);
    const canDrop = accepts(draggedOption, category);
    return <section key={category} data-slot-type={category} data-filled={filled} className={`${styles.slot} ${category === "base" ? styles.baseSlot : ""} ${filled ? styles.slotActive : ""} ${slotFeedback?.category === category ? styles.slotUpdated : ""} ${canDrop ? styles.dropReady : ""} ${dropHover === category ? styles.dropHover : ""}`} aria-label={slotNames[category]} onDragOver={event => {
      if (canDrop && event.dataTransfer.types.includes(dragType)) {
        event.preventDefault(); event.dataTransfer.dropEffect = "copy"; setDropHover(category);
      } else { event.dataTransfer.dropEffect = "none"; }
    }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropHover(current => current === category ? null : current); }} onDrop={event => drop(event, category)}>
      <div className={styles.slotHeading}><h3>{groupNames[category]}</h3>{filled && <Check size={15} aria-hidden="true" />}</div>
      <p className={styles.slotLabel}>{slotNames[category]}</p>
      {multiple && installed.length > 0 ? <><div className={styles.chips}>{installed.map(option => <span key={option.id} className={styles.chip}>{option.name}<button type="button" disabled={!ready} aria-label={`从插槽移除 ${option.name}`} onClick={event => { event.stopPropagation(); update(option, "remove"); }}><X size={14} aria-hidden="true" /></button></span>)}</div><p className={styles.addMore}>＋ 可继续添加</p></> : installed.length > 0 ? <div className={styles.installedModule}><h4>{installed[0].name}</h4>{installed[0].description && <p>{installed[0].description}</p>}<div className={styles.installedActions}><span>{optedOut ? "已设为不安装" : unavailable ? "当前模块不可用" : category === "base" ? "✓ 已选择基础平台" : "✓ 已安装"}</span><button type="button" disabled={!ready} aria-label={`从插槽移除 ${installed[0].name}`} onClick={event => { event.stopPropagation(); update(installed[0], "remove"); }}><X size={13} aria-hidden="true" />移除</button></div></div> : <div className={styles.emptySlot}><Plus size={20} strokeWidth={1} aria-hidden="true" /><p>{allowDrag ? "将模块拖到这里" : "点击部件库中的 ＋ 添加"}</p><span>{allowDrag ? "或点击左侧模块库中的 ＋" : "展开下方分类，选择对应模块"}</span></div>}
      <button type="button" className={styles.slotNavigate} aria-label={`${filled ? "修改" : "选择"}${categoryNames[category]}模块`} aria-controls={`options-${category}`} onClick={() => navigateToCategory(category)}>
        {filled ? "修改模块 →" : "点击选择模块 →"}
      </button>
      {dropHover === category && <div className={styles.dropMessage}>释放以添加{slotNames[category].replace("插槽", "")}</div>}
    </section>;
  };

  return (
    <div className={styles.page}>
      <p className={styles.navigationHint} role="status" aria-live="polite" data-visible={!!navigation}>
        {navigation ? `已定位到${navigation.category === "vision" ? "感知系统" : categoryNames[navigation.category]}，请选择模块` : ""}
      </p>
      <header className={styles.heading}>
        <p>ONE-G / CONFIGURATOR</p>
        <h1>CONFIGURE YOUR <span>ONE-G</span></h1>
      </header>
      <div className={styles.workspace}>
        <section className={styles.moduleLibrary} aria-label="模块库">
          <header className={styles.panelHeading}><h2>MODULE LIBRARY</h2><p>选择模块，构建你的 ONE-G</p></header>
          <div ref={libraryScrollRef} className={styles.libraryScroll} tabIndex={0} aria-label="模块分类列表"><div className={styles.accordion}>{groups.map(library)}</div></div>
        </section>

        <section className={styles.currentBuild} aria-label="当前配置结构" aria-busy={!ready}>
          <header className={styles.buildHeading}>
            <div><h2>CURRENT BUILD</h2><p>当前配置结构</p></div>
            <span className={styles.buildStatus} role="status">{!ready ? "读取中…" : completedCount === dimensions.length ? "✓ 配置完整" : `${completedCount} / ${dimensions.length} 已配置`}</span>
          </header>
          <p className={styles.buildHint}>{!ready ? "正在读取已保存方案…" : !configuration.baseRobotId ? "还未选择基础平台，也可以先添加其他模块" : invalid.length ? "存在不可用模块，请调整配置" : "自由添加或替换模块，构建当前配置"}</p>
          <div className={styles.slots}>{groups.map(group => slot(group.category))}</div>
          <section className={styles.progress} aria-label="配置进度">
            <div className={styles.progressHeading}>
              <h3>CONFIGURATION PROGRESS</h3>
              <span aria-live="polite">{ready ? `${completion}%` : "读取中…"}</span>
            </div>
            <div role="progressbar" aria-label="配置完成度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={ready ? completion : undefined} aria-valuetext={ready ? `已配置 ${completedCount} / ${dimensions.length} 类模块` : "读取中"} className={styles.progressTrack}>
              {dimensions.map(dimension => <span key={dimension.category} className={ready && dimension.complete ? styles.progressComplete : ""} />)}
            </div>
            <div className={styles.progressLabels} aria-hidden="true">
              {dimensions.map(dimension => <span key={dimension.category} className={ready && dimension.complete ? styles.dimensionComplete : ""}>{progressNames[dimension.category]}</span>)}
            </div>
            <p>按已安装模块统计，可自由选配，不影响保存。</p>
          </section>
        </section>

        <aside className={styles.summaryPanel} aria-label="配置清单与价格">
          <header className={styles.panelHeading}><h2>CONFIGURATION SUMMARY</h2><p>当前配置清单</p></header>
          <div className={styles.summaryScroll} tabIndex={0} aria-label="已选模块清单">
            <dl className={styles.configurationList}>
              {groups.map(group => {
                const items = selected.filter(option => option.category === group.category);
                return (
                  <div key={group.category} className={styles.summaryGroup}>
                    <dt>{categoryNames[group.category]}</dt>
                    <dd>
                      {!ready ? <p className={styles.unselected}>读取中…</p> : items.length ? items.map(option => (
                        <div key={option.id} className={styles.summaryItem}>
                          <div><span>{option.name}</span><small>{formatPrice(option.price)}</small></div>
                          <button type="button" aria-label={`从清单移除 ${option.name}`} onClick={() => update(option, "remove")}><X size={13} aria-hidden="true" /></button>
                        </div>
                      )) : <p className={styles.unselected}>未选择</p>}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
          <section className={styles.priceSummary} aria-label="价格明细">
            <h3>PRICE SUMMARY</h3>
            <dl>{rows.map((row, index) => <div key={groups[index].category}><dt>{categoryNames[groups[index].category]}</dt><dd>{ready ? formatPrice(row.price) : "—"}</dd></div>)}</dl>
          </section>
          <div className={styles.price}>
            <span>TOTAL / 预估总价</span>
            <strong data-testid="configuration-total" aria-live="polite">{ready ? formatPrice(total) : "正在读取…"}</strong>
            <small>演示价格，仅用于原型展示</small>
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.save} disabled={!canSave} onClick={() => save()}>保存方案</button>
            <ShimmerButton type="button" className={styles.cartButton} disabled={!canSave} onClick={() => save(true)}>加入购物车</ShimmerButton>
            <button type="button" className={styles.clear} disabled={!ready} onClick={() => {
              setConfiguration({ ...emptyConfiguration, visionIds: [], capabilityIds: [] });
              setNotice("已清空当前编辑配置；保存后更新本地方案。");
            }}>清空配置</button>
          </div>
          <div className={styles.feedback}>
            <p>{!ready ? "正在读取…" : !configuration.baseRobotId ? "选择基础平台后即可保存" : invalid.length ? "请移除不可用模块后保存" : "兼容规则待正式产品确认"}</p>
            <p role="status">{notice}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
