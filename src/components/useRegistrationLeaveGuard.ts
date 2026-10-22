"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type NavigationEvent = Event & {
  destination: { url: string; key: string };
  navigationType: "push" | "replace" | "reload" | "traverse";
};
type BrowserNavigation = EventTarget & { traverseTo(key: string): { finished: Promise<unknown> } };

// Installed only while this registration form is dirty. No global Link mutation,
// popstate cancellation or synthetic history entries. Unsupported traversal falls
// back to browser beforeunload when a document unload is actually attempted.
export function useRegistrationLeaveGuard(dirty: boolean, clear: () => void) {
  const router = useRouter();
  const released = useRef(false);
  const action = useRef<(() => void) | null>(null);
  const [open, setOpen] = useState(false);
  const unload = useRef<(event: BeforeUnloadEvent) => void>(() => {});
  const allow = useCallback((next: () => void) => {
    released.current = true; window.removeEventListener("beforeunload", unload.current);
    clear(); setOpen(false); action.current = null; next();
  }, [clear]);
  const request = useCallback((next: () => void) => {
    if (!dirty || released.current) { allow(next); return; }
    if (!action.current) { action.current = next; setOpen(true); }
  }, [dirty, allow]);
  useEffect(() => {
    if (!dirty) return;
    const onUnload = (event: BeforeUnloadEvent) => {
      if (!released.current) { event.preventDefault(); event.returnValue = ""; }
    };
    unload.current = onUnload;
    window.addEventListener("beforeunload", onUnload);
    const click = (event: MouseEvent) => {
      if (released.current || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!anchor || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;
      const target = new URL(anchor.href, location.href);
      const here = new URL(location.href);
      if (target.origin === here.origin && target.pathname === here.pathname && target.search === here.search) return;
      event.preventDefault(); event.stopPropagation();
      request(() => {
        if (target.origin === location.origin) {
          const logicalPath = target.pathname.replace(/^\/one-g(?=\/|$)/, "") || "/";
          router.push(`${logicalPath}${target.search}${target.hash}`);
        } else location.assign(target.href);
      });
    };
    document.addEventListener("click", click, true);
    const navigation = (window as Window & { navigation?: BrowserNavigation }).navigation;
    const navigate = (raw: Event) => {
      const event = raw as NavigationEvent;
      if (released.current || !event.cancelable || event.navigationType === "reload") return;
      const target = new URL(event.destination.url); const here = new URL(location.href);
      if (target.origin === here.origin && target.pathname === here.pathname && target.search === here.search) return;
      // Only cancel supported same-origin history traversal here. Next Link
      // clicks and our normal programmatic paths are guarded before routing.
      if (event.navigationType === "traverse" && navigation && target.origin === here.origin) {
        event.preventDefault();
        request(() => { void navigation.traverseTo(event.destination.key).finished.catch(() => {}); });
      }
    };
    navigation?.addEventListener("navigate", navigate);
    return () => { window.removeEventListener("beforeunload", onUnload); document.removeEventListener("click", click, true); navigation?.removeEventListener("navigate", navigate); };
  }, [dirty, request, router]);
  return { open, request, allow, continueEditing: () => { action.current = null; setOpen(false); }, confirm: () => { if (action.current) allow(action.current); } };
}
