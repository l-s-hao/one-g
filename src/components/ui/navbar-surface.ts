/** Resource hints are approximate; a low thread count alone never disables blur. */
export type NavbarSurface = "solid" | "blur" | "unsupported" | "reduced-transparency" | "save-data" | "low-resources" | "forced-solid" | "forced-colors" | "coarse-pointer";
export interface NavbarSurfaceSignals {
  supportsBlur: boolean;
  reducedTransparency: boolean;
  reducedMotion?: boolean;
  forcedSolid?: boolean;
  forcedColors?: boolean;
  coarsePointer?: boolean;
  saveData?: boolean;
  deviceMemory?: number;
  hardwareConcurrency?: number;
}

export function chooseNavbarSurface(signals: NavbarSurfaceSignals): NavbarSurface {
  if (signals.forcedSolid) return "forced-solid";
  if (signals.forcedColors) return "forced-colors";
  if (signals.coarsePointer) return "coarse-pointer";
  if (!signals.supportsBlur) return "unsupported";
  if (signals.reducedTransparency) return "reduced-transparency";
  if (signals.saveData) return "save-data";
  const lowMemory = typeof signals.deviceMemory === "number" && signals.deviceMemory > 0 && signals.deviceMemory <= 2;
  const lowThreads = typeof signals.hardwareConcurrency === "number" && signals.hardwareConcurrency > 0 && signals.hardwareConcurrency <= 2;
  return lowMemory && lowThreads ? "low-resources" : "blur";
}

type ConnectionHints = EventTarget & { saveData?: boolean };
type NavigatorHints = Navigator & { deviceMemory?: number; connection?: ConnectionHints };

export function navbarSurfaceSnapshot(): NavbarSurface {
  const hints = navigator as NavigatorHints;
  return chooseNavbarSurface({
    supportsBlur: typeof CSS !== "undefined" && typeof CSS.supports === "function" && (CSS.supports("backdrop-filter", "blur(1px)") || CSS.supports("-webkit-backdrop-filter", "blur(1px)")),
    reducedTransparency: window.matchMedia("(prefers-reduced-transparency: reduce)").matches,
    // 内部排错路径不创建用户偏好或公开性能菜单；窄屏粗指针为保守产品策略，非GPU判断。
    forcedSolid: new URLSearchParams(location.search).get("navbarSurface") === "solid",
    forcedColors: window.matchMedia("(forced-colors: active)").matches,
    coarsePointer: window.matchMedia("(max-width: 1023px) and (pointer: coarse)").matches,
    saveData: hints.connection?.saveData,
    deviceMemory: hints.deviceMemory,
    hardwareConcurrency: hints.hardwareConcurrency,
  });
}

export function subscribeNavbarSurface(notify: () => void) {
  const queries = [window.matchMedia("(prefers-reduced-transparency: reduce)"), window.matchMedia("(forced-colors: active)"), window.matchMedia("(max-width: 1023px) and (pointer: coarse)")];
  queries.forEach(query => query.addEventListener("change", notify));
  const connection = (navigator as NavigatorHints).connection;
  connection?.addEventListener("change", notify);
  return () => {
    queries.forEach(query => query.removeEventListener("change", notify));
    connection?.removeEventListener("change", notify);
  };
}

// Opaque during SSR/initial hydration and with JavaScript disabled.
export const navbarSurfaceServerSnapshot = (): NavbarSurface => "solid";
