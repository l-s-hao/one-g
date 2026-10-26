"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = { children: ReactNode; className?: string; as?: "div" | "ol" };

/** Opt-in static card groups. Existing hosts enter; their child surfaces own hover. */
export default function StaggerGroup({ as = "div", children, ...props }: Props) {
  const root = useRef<HTMLDivElement & HTMLOListElement>(null);
  const seen = useRef(new WeakSet<Element>());
  useEffect(() => {
    const group = root.current;
    if (!group || typeof IntersectionObserver !== "function" || typeof Element.prototype.animate !== "function" || typeof matchMedia !== "function") return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches || document.hidden) return;
    const items = Array.from(group.children).filter((item): item is HTMLElement => item instanceof HTMLElement && item.hasAttribute("data-card-hover-host"));
    const animations = new Map<HTMLElement, Animation>();
    let observer: IntersectionObserver | undefined;
    let stopped = false;
    const settle = (item: HTMLElement) => {
      seen.current.add(item);
      observer?.unobserve(item);
      animations.get(item)?.cancel(); // No fill/style remains: underlying content is always visible.
      animations.delete(item);
    };
    const settleAll = () => {
      stopped = true;
      observer?.disconnect();
      items.forEach(settle);
    };
    const interact = (event: Event) => {
      if (!(event.target instanceof Node)) return;
      const item = items.find(item => item.contains(event.target as Node));
      if (item) settle(item);
    };
    const visibility = () => { if (document.hidden) settleAll(); };
    const reduce = () => { if (media.matches) settleAll(); };
    try {
      observer = new IntersectionObserver(entries => {
        if (document.hidden || media.matches) { settleAll(); return; }
        // Each visible batch starts at zero. Six-item local batches cap the delay at 500ms.
        const entering = items.filter(item => entries.some(entry => entry.target === item && entry.isIntersecting) && !seen.current.has(item));
        entering.forEach((item, index) => {
          if (stopped) return;
          seen.current.add(item);
          observer?.unobserve(item);
          if (item.contains(document.activeElement)) return;
          try {
            const animation = item.animate([
              { opacity: 0, transform: "translateY(8px)" },
              { opacity: 1, transform: "translateY(0)" },
            ], { duration: 350, delay: (index % 6) * 100, easing: "cubic-bezier(0.2, 0, 0.2, 1)", fill: "backwards" });
            animations.set(item, animation);
            void animation.finished.then(() => {
              animation.cancel();
              if (animations.get(item) === animation) animations.delete(item);
            }, () => {
              if (animations.get(item) === animation) animations.delete(item);
            });
          } catch { settleAll(); }
        });
      }, { threshold: 0.01 });
      items.forEach(item => { if (!seen.current.has(item)) observer?.observe(item); });
    } catch { settleAll(); return; }
    group.addEventListener("focusin", interact);
    group.addEventListener("pointerdown", interact, true);
    document.addEventListener("visibilitychange", visibility);
    media.addEventListener("change", reduce);
    return () => {
      observer?.disconnect();
      animations.forEach(animation => animation.cancel());
      animations.clear();
      group.removeEventListener("focusin", interact);
      group.removeEventListener("pointerdown", interact, true);
      document.removeEventListener("visibilitychange", visibility);
      media.removeEventListener("change", reduce);
    };
  }, []);
  return as === "ol"
    ? <ol {...props} ref={root} data-stagger-group="">{children}</ol>
    : <div {...props} ref={root} data-stagger-group="">{children}</div>;
}
