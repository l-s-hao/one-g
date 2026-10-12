"use client";

import { useCallback, useEffect, useRef } from "react";

/** A single decorative surface; menu state remains owned by Header. */
export default function useNavigationHighlight(currentHref: string | undefined, locale: string) {
  const nav = useRef<HTMLElement>(null);
  const target = useRef<string | undefined>(currentHref);
  const position = useCallback((href: string | undefined, immediate = false) => {
    target.current = href;
    const container = nav.current;
    const slider = container?.querySelector<HTMLElement>("[data-navigation-highlight]");
    const item = Array.from(container?.querySelectorAll<HTMLElement>("[data-navigation-item]") ?? []).find(element => element.dataset.navigationItem === href);
    if (!container || !slider) return;
    if (!item || !container.getBoundingClientRect().width || !matchMedia("(hover: hover) and (pointer: fine)").matches) {
      slider.style.opacity = "0";
      return;
    }
    const bounds = item.getBoundingClientRect();
    const origin = container.getBoundingClientRect();
    // First entry and remeasurement must not fly in from a stale position.
    const snap = immediate || slider.style.opacity !== "1";
    if (snap) slider.style.transition = "none";
    slider.style.transform = `translateX(${bounds.left - origin.left}px)`;
    slider.style.width = `${bounds.width}px`;
    slider.style.top = `${bounds.top - origin.top + 4}px`;
    slider.style.height = `${Math.max(0, bounds.height - 8)}px`;
    if (snap) { void slider.offsetWidth; slider.style.removeProperty("transition"); }
    slider.style.opacity = "1";
  }, []);
  const restore = useCallback(() => position(currentHref), [currentHref, position]);
  useEffect(() => {
    let disposed = false;
    const remeasure = () => position(target.current, true);
    const container = nav.current;
    const observer = new ResizeObserver(remeasure);
    if (container) {
      observer.observe(container);
      container.querySelectorAll<HTMLElement>("[data-navigation-item]").forEach(item => observer.observe(item));
    }
    const pointer = matchMedia("(hover: hover) and (pointer: fine)");
    pointer.addEventListener("change", remeasure);
    document.fonts.addEventListener("loadingdone", remeasure);
    void document.fonts.ready.then(() => { if (!disposed) remeasure(); });
    remeasure();
    return () => { disposed = true; observer.disconnect(); pointer.removeEventListener("change", remeasure); document.fonts.removeEventListener("loadingdone", remeasure); };
  }, [nav, position, locale]);
  return { nav, position, restore };
}
