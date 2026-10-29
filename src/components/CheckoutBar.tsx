"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { LDiv } from "@/i18n/Elements";

/** Reserve the actual fixed bar height, including wrapped labels and safe area. */
export default function CheckoutBar(props: ComponentPropsWithoutRef<"div">) {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = bar.current;
    if (!element) return;
    // Both consumers live in SiteShell. Reserve at the end of its scrolling
    // content, so the final Footer controls also remain reachable above the bar.
    const shell = element.closest("main")?.parentElement;
    const measure = () => shell?.style.setProperty("--checkout-bar-height", `${element.getBoundingClientRect().height}px`);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => { observer.disconnect(); shell?.style.removeProperty("--checkout-bar-height"); };
  }, []);
  return <LDiv {...props} ref={bar} />;
}
