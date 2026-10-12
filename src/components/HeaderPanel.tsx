"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { LDiv } from "@/i18n/Elements";

/** Keep a closing panel visible for its exit, but inert from the first frame. */
export default function HeaderPanel({ open, id, className, children }: {
  open: boolean; id: string; className?: string; children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const animation = useRef<Animation | null>(null);
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const wasHidden = element.hidden;
    const current = getComputedStyle(element);
    const opacity = wasHidden ? "0" : current.opacity;
    const transform = wasHidden ? "translateY(-6px)" : current.transform;
    animation.current?.cancel();
    element.inert = !open;
    element.style.pointerEvents = open ? "" : "none";
    if (!open && wasHidden) return;
    element.hidden = false;
    const end = { opacity: open ? 1 : 0, transform: open ? "translateY(0)" : "translateY(-6px)" };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || typeof element.animate !== "function") {
      element.hidden = !open;
      return;
    }
    const instance = element.animate([{ opacity, transform }, end], {
      duration: 240, easing: "cubic-bezier(0.22,1,0.36,1)", fill: "forwards",
    });
    animation.current = instance;
    void instance.finished.then(() => {
      if (animation.current !== instance) return;
      element.hidden = !open;
      instance.cancel();
      animation.current = null;
    }).catch(() => { /* Superseded transitions are cancelled intentionally. */ });
    // Next transition reads the visible frame before cancelling it.
  }, [open]);
  useLayoutEffect(() => () => animation.current?.cancel(), []);
  return <LDiv ref={root} id={id} className={className} hidden inert={!open} aria-hidden={!open}>{children}</LDiv>;
}
