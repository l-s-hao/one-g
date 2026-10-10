"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { english, type Locale, type MessageKey } from "./dictionary";

const preferenceKey = "one-g-locale";
const entries = Object.entries(english).sort((a, b) => b[0].length - a[0].length);
const missing = new Set<string>();
export function translate(text: string, locale: Locale): string {
  if (locale === "zh-CN" || !/[\u3400-\u9fff]/.test(text)) return text;
  const trimmed = text.trim();
  if (trimmed in english) return text.replace(trimmed, english[trimmed as MessageKey]);
  let output = text;
  for (const [source, target] of entries) if (output.includes(source)) output = output.split(source).join(target);
  if (/[\u3400-\u9fff]/.test(output) && !missing.has(text)) {
    missing.add(text);
    console.error(`[i18n] Missing message: ${text}`);
  }
  return output;
}
const LocaleContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void }>({ locale: "zh-CN", setLocale: () => {} });
const subscribeHydration = () => () => {};
const serverLocale = (): Locale => "zh-CN";
export function useLocale() {
  const context = useContext(LocaleContext);
  // Suspense children may hydrate after preference restoration. Each boundary still
  // consumes the server snapshot first, then the live locale without remounting.
  const locale = useSyncExternalStore(subscribeHydration, () => context.locale, serverLocale);
  return { locale, setLocale: context.setLocale };
}
export default function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, updateLocale] = useState<Locale>("zh-CN");
  const pathname = usePathname();
  const titles = useRef(new Map<string, string>());
  useEffect(() => {
    try {
      const saved = localStorage.getItem(preferenceKey);
      // Restore first; never persist the default before reading the saved preference.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydration uses the same Chinese default as SSR.
      if (saved === "en" || saved === "zh-CN") updateLocale(saved);
    } catch { /* In-memory switching remains available. */ }
  }, []);
  const value = useMemo(() => ({ locale, setLocale: (next: Locale) => {
    updateLocale(next);
    try { localStorage.setItem(preferenceKey, next); } catch { /* In-memory preference. */ }
  } }), [locale]);
  useEffect(() => {
    document.documentElement.lang = locale;
    let chineseTitle = titles.current.get(pathname) ?? document.title;
    const syncTitle = () => {
      const current = document.title;
      if (/[\u3400-\u9fff]/.test(current)) chineseTitle = current;
      else {
        const original = entries.find(([, target]) => target === current)?.[0];
        if (original) chineseTitle = original;
      }
      titles.current.set(pathname, chineseTitle);
      const next = locale === "en" ? translate(chineseTitle, locale) : chineseTitle;
      if (document.title !== next) document.title = next;
    };
    syncTitle();
    const observer = new MutationObserver(syncTitle);
    const title = document.querySelector("title");
    if (title) observer.observe(title, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [locale, pathname]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
