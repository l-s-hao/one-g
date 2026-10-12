"use client";

// Adapted from Aceternity's official Layout Grid registry (Manu Arora).
// https://ui.aceternity.com/registry/layout-grid.json
// Preserves the in-grid card/image/content shared layout transitions and scrim.
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { translate, useLocale } from "@/i18n/LocaleProvider";
import { LSpan } from "@/i18n/Elements";
import { useHomePreview } from "../HomePreviewProvider";
import styles from "./layout-grid.module.css";

export type LayoutGridCard = {
  id: string;
  title: string;
  content: ReactNode;
  thumbnail: string;
  imageAlt: string;
  width: number;
  height: number;
  fit: "contain" | "cover";
  wide?: boolean;
};

type PanelPosition = { top: number; height: number };

export function LayoutGrid({ cards, namespace }: { cards: LayoutGridCard[]; namespace: string }) {
  const { selectedId, setSelectedId } = useHomePreview();
  const { locale } = useLocale();
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const triggers = useRef(new Map<string, HTMLButtonElement>());
  const focusFrame = useRef(0);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [position, setPosition] = useState<PanelPosition | null>(null);
  const active = cards.find(card => selectedId === `${namespace}:${card.id}`);
  const activeId = active?.id;
  const transition = { duration: reduced ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

  const close = useCallback(() => {
    if (!activeId) return;
    const id = activeId;
    setLastSelectedId(id);
    setSelectedId(null);
    cancelAnimationFrame(focusFrame.current);
    focusFrame.current = requestAnimationFrame(() => triggers.current.get(id)?.focus({ preventScroll: true }));
  }, [activeId, setSelectedId]);

  const open = (id: string) => {
    const grid = root.current;
    const trigger = triggers.current.get(id);
    if (!grid || !trigger) return;
    let gridRect = grid.getBoundingClientRect();
    const headerBottom = document.querySelector("header.site-header")?.getBoundingClientRect().bottom ?? 48;
    // Geometry is measured only on interaction. SSR always renders an empty selection.
    // A narrow-screen panel stays in the visible portion of its own long grid.
    const height = Math.min(gridRect.height - 24, Math.max(280, window.innerHeight - headerBottom - 32), 620);
    // A partially visible first thumbnail must not leave the entire preview below
    // the viewport. Reveal this local grid using ordinary document scrolling.
    if (gridRect.top > headerBottom + 16 && gridRect.top + height + 12 > window.innerHeight - 16) {
      grid.scrollIntoView({ block: "start", behavior: "instant" });
      gridRect = grid.getBoundingClientRect();
    }
    const cardRect = trigger.getBoundingClientRect();
    const viewportTop = Math.max(headerBottom + 16, Math.min(cardRect.top, window.innerHeight - height - 16));
    const top = Math.max(12, Math.min(viewportTop - gridRect.top, gridRect.height - height - 12));
    setPosition({ top, height });
    setSelectedId(`${namespace}:${id}`);
  };

  useEffect(() => {
    if (!activeId) return;
    const frame = requestAnimationFrame(() => closeButton.current?.focus({ preventScroll: true }));
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close(); }
    };
    window.addEventListener("keydown", escape);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("keydown", escape); };
  }, [activeId, close]);
  useEffect(() => () => cancelAnimationFrame(focusFrame.current), []);

  return <LayoutGroup id={namespace}>
    <div ref={root} className={styles.grid} data-layout-grid={namespace} data-expanded={activeId ?? ""}>
      {cards.map(card => {
        const expanded = active?.id === card.id;
        const panelStyle: CSSProperties | undefined = expanded && position ? {
          "--panel-top": `${position.top}px`, "--panel-height": `${position.height}px`,
        } as CSSProperties : undefined;
        return <div key={card.id} className={cn(styles.slot, card.wide && styles.wide)} data-preview-id={card.id}>
          <motion.article
            layout={!reduced}
            layoutId={reduced ? undefined : `${namespace}:card:${card.id}`}
            transition={transition}
            style={panelStyle}
            className={cn(styles.card, expanded && styles.expanded, lastSelectedId === card.id && styles.returning)}
            aria-hidden={active && !expanded ? true : undefined}
            aria-labelledby={expanded ? `${namespace}-${card.id}-title` : undefined}
            data-preview-panel={expanded ? card.id : undefined}>
            <motion.img
              layout={!reduced}
              layoutId={reduced ? undefined : `${namespace}:image:${card.id}`}
              transition={transition}
              src={card.thumbnail} width={card.width} height={card.height}
              alt={expanded ? translate(card.imageAlt, locale) : ""}
              loading="lazy" decoding="async"
              className={cn(styles.image, card.fit === "cover" && styles.cover)} />
            <button type="button" className={styles.trigger}
              ref={node => { if (node) triggers.current.set(card.id, node); else triggers.current.delete(card.id); }}
              hidden={expanded} disabled={!!active && !expanded}
              aria-expanded={expanded} aria-controls={`${namespace}-${card.id}-preview`}
              aria-label={`${translate("展开预览", locale)}: ${translate(card.title, locale)}`}
              onClick={() => open(card.id)}>
              <span className={styles.label}><LSpan className={styles.name}>{card.title}</LSpan><span className={styles.hint}><LSpan>点击展开</LSpan><ArrowUpRight size={16} aria-hidden="true"/></span></span>
            </button>
            {expanded && <>
              <motion.div id={`${namespace}-${card.id}-preview`} className={styles.content}
                layoutId={reduced ? undefined : `${namespace}:content:${card.id}`}
                initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.25, delay: reduced ? 0 : 0.12 }}>
                {card.content}
              </motion.div>
              <button ref={closeButton} className={styles.close} type="button" aria-label={translate("关闭预览", locale)} onClick={close}><X size={18} aria-hidden="true"/></button>
            </>}
          </motion.article>
        </div>;
      })}
      <motion.div className={styles.scrim} aria-hidden="true" data-preview-scrim
        style={{ pointerEvents: active ? "auto" : "none" }}
        animate={{ opacity: active ? 1 : 0 }} transition={{ duration: reduced ? 0 : 0.25 }} onClick={close}/>
    </div>
  </LayoutGroup>;
}
