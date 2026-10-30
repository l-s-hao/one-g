/** Resource hints are approximate; a low thread count alone never disables blur. */
export type NavbarSurface = "solid" | "blur" | "unsupported" | "reduced-transparency" | "reduced-motion" | "save-data" | "low-resources";
export interface NavbarSurfaceSignals {
  supportsBlur: boolean;
  reducedTransparency: boolean;
  reducedMotion: boolean;
  saveData?: boolean;
  deviceMemory?: number;
  hardwareConcurrency?: number;
}

export function chooseNavbarSurface(signals: NavbarSurfaceSignals): NavbarSurface {
  if (!signals.supportsBlur) return "unsupported";
  if (signals.reducedTransparency) return "reduced-transparency";
  if (signals.reducedMotion) return "reduced-motion";
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
    supportsBlur: typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("backdrop-filter", "blur(1px)"),
    reducedTransparency: window.matchMedia("(prefers-reduced-transparency: reduce)").matches,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: hints.connection?.saveData,
    deviceMemory: hints.deviceMemory,
    hardwareConcurrency: hints.hardwareConcurrency,
  });
}

export function subscribeNavbarSurface(notify: () => void) {
  const queries = [window.matchMedia("(prefers-reduced-transparency: reduce)"), window.matchMedia("(prefers-reduced-motion: reduce)")];
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
