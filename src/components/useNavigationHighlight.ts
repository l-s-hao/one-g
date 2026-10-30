"use client";

import { useCallback, useLayoutEffect, useRef } from "react";

type Capsule = { x: number; y: number; width: number; height: number };
type Frame = { pathname: string; visible: boolean; box: Capsule };
// Presentation geometry only: actual selection always comes from Header's pathname.
// This survives the existing route-keyed menu remount without retaining menu state.
const previousFrames = new WeakMap<Document, Frame>();
const applyBox = (slider: HTMLElement, box: Capsule) => {
  slider.style.transform = `translateX(${box.x}px)`;
  slider.style.top = `${box.y}px`;
  slider.style.width = `${box.width}px`;
  slider.style.height = `${box.height}px`;
};

/** One shared capsule; existing Header remains responsible for routes and drawers. */
export default function useNavigationHighlight(currentHref: string | undefined, locale: string, pathname: string) {
  const nav = useRef<HTMLElement>(null);
  const target = useRef<string | undefined>(currentHref);
  const lastBox = useRef<Capsule | null>(null);
  const position = useCallback((href: string | undefined, immediate = false) => {
    target.current = href;
    const container = nav.current;
    const slider = container?.querySelector<HTMLElement>("[data-navigation-highlight]");
    const item = Array.from(container?.querySelectorAll<HTMLElement>("[data-navigation-item]") ?? []).find(element => element.dataset.navigationItem === href);
    if (!container || !slider) return;
    if (!item || !container.getBoundingClientRect().width) {
      slider.style.opacity = "0";
      delete slider.dataset.highlightTarget;
      return;
    }
    const bounds = item.getBoundingClientRect();
    const origin = container.getBoundingClientRect();
    const style = getComputedStyle(container);
    const padding = parseFloat(style.getPropertyValue("--navigation-pill-padding")) || 16;
    const height = Math.min(parseFloat(style.getPropertyValue("--navigation-pill-height")) || 42, bounds.height);
    const box = { x: bounds.left - origin.left - padding, y: bounds.top - origin.top + (bounds.height - height) / 2, width: bounds.width + padding * 2, height };
    // Observer/font-ready initial notifications must not snap an in-flight route transition.
    if (immediate && slider.style.opacity === "1" && slider.dataset.highlightTarget === href && lastBox.current
      && (Object.keys(box) as (keyof Capsule)[]).every(key => Math.abs(box[key] - lastBox.current![key]) < 0.01)) return;
    const snap = immediate || slider.style.opacity !== "1";
    if (snap) slider.style.transition = "none";
    applyBox(slider, box);
    slider.style.opacity = "1";
    slider.dataset.highlightTarget = href;
    lastBox.current = box;
    previousFrames.set(container.ownerDocument, { pathname, visible: true, box });
    if (snap) { void slider.offsetWidth; slider.style.removeProperty("transition"); }
  }, [pathname]);
  const restore = useCallback(() => position(currentHref), [currentHref, position]);

  useLayoutEffect(() => {
    let disposed = false;
    const container = nav.current;
    const slider = container?.querySelector<HTMLElement>("[data-navigation-highlight]");
    if (!container || !slider) return;
    const previous = previousFrames.get(container.ownerDocument);
    target.current = currentHref;
    if (previous?.visible && previous.pathname !== pathname && currentHref && container.getBoundingClientRect().width) {
      slider.style.transition = "none";
      applyBox(slider, previous.box);
      slider.style.opacity = "1";
      void slider.offsetWidth;
      slider.style.removeProperty("transition");
      position(currentHref);
    } else position(currentHref, true);

    const remeasure = () => position(target.current, true);
    const observer = new ResizeObserver(remeasure);
    observer.observe(container);
    container.querySelectorAll<HTMLElement>("[data-navigation-item]").forEach(item => observer.observe(item));
    const pointer = matchMedia("(hover: hover) and (pointer: fine)");
    const leave = () => restore();
    const blur = (event: FocusEvent) => {
      if (!(event.relatedTarget instanceof Node) || !container.contains(event.relatedTarget)) restore();
    };
    container.addEventListener("pointerleave", leave);
    container.addEventListener("focusout", blur);
    pointer.addEventListener("change", remeasure);
    document.fonts.addEventListener("loadingdone", remeasure);
    void document.fonts.ready.then(() => { if (!disposed) remeasure(); });
    return () => {
      disposed = true;
      // Capture the actual visible position, including an interrupted CSS transition.
      if (container.isConnected && container.getBoundingClientRect().width) {
        const origin = container.getBoundingClientRect(), bounds = slider.getBoundingClientRect();
        previousFrames.set(container.ownerDocument, { pathname, visible: parseFloat(getComputedStyle(slider).opacity) > 0,
          box: { x: bounds.left - origin.left, y: bounds.top - origin.top, width: bounds.width, height: bounds.height } });
      }
      observer.disconnect();
      container.removeEventListener("pointerleave", leave);
      container.removeEventListener("focusout", blur);
      pointer.removeEventListener("change", remeasure);
      document.fonts.removeEventListener("loadingdone", remeasure);
    };
  }, [currentHref, pathname, position, locale, restore]);
  return { nav, position, restore };
}
