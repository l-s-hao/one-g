"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { SmoothCursor } from "@/components/ui/smooth-cursor";

const ENABLED_ROUTES = new Set(["/", "/about", "/customize/start"]);
const EXCLUDED_REGION =
  '[data-no-smooth-cursor], input, textarea, select, [contenteditable="true"]';

const CURSOR_QUERY =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(CURSOR_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function GlobalSmoothCursor() {
  const pathname = usePathname();
  const desktop = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(CURSOR_QUERY).matches,
    () => false,
  );

  const enabled = desktop && ENABLED_ROUTES.has(pathname);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const [region, setRegion] = useState({ pathname, suppressed: true });
  const suppressed = region.pathname !== pathname || region.suppressed;

  useEffect(() => {
    if (!enabled) return;
    document.body.classList.add("smooth-cursor-enabled");
    const update = (target: EventTarget | null) => {
      const next = !(target instanceof Element) || !!target.closest(EXCLUDED_REGION);
      setRegion(previous => previous.pathname === pathname && previous.suppressed === next
        ? previous : { pathname, suppressed: next });
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        pointer.current = null;
        update(null);
        return;
      }
      pointer.current = { x: event.clientX, y: event.clientY };
      update(event.target);
    };
    const checkPosition = () => {
      const position = pointer.current;
      update(position ? document.elementFromPoint(position.x, position.y) : null);
    };
    // Recheck after navigation or scrolling even if the mouse hasn't moved.
    const frame = requestAnimationFrame(checkPosition);
    window.addEventListener("pointermove", move, { passive: true, capture: true });
    window.addEventListener("pointerover", move, { passive: true, capture: true });
    window.addEventListener("pointerdown", move, { passive: true, capture: true });
    window.addEventListener("scroll", checkPosition, { passive: true, capture: true });
    return () => {
      cancelAnimationFrame(frame);
      document.body.classList.remove("smooth-cursor-enabled");
      window.removeEventListener("pointermove", move, true);
      window.removeEventListener("pointerover", move, true);
      window.removeEventListener("pointerdown", move, true);
      window.removeEventListener("scroll", checkPosition, true);
    };
  }, [enabled, pathname]);

  if (!enabled) return null;
  return (
    <div className={`smooth-cursor-host${suppressed ? " is-suppressed" : ""}`}>
      <SmoothCursor />
    </div>
  );
}
