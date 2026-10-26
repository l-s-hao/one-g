/** Shared by Next configuration and untrusted return/legacy route normalization. */
export const BASE_PATH = "/one-g";
export function appPathname(pathname: string): string {
  return pathname === BASE_PATH ? "/" : pathname.startsWith(`${BASE_PATH}/`) ? pathname.slice(BASE_PATH.length) : pathname;
}

/** Decode once, normalize dot segments, then classify the same logical path as the router. */
export function localAppPathname(pathname: string): string | null {
  if (!pathname.startsWith("/") || pathname.startsWith("//")) return null;
  try {
    const decoded = decodeURIComponent(pathname);
    if (/[\\\u0000-\u0020%]/.test(decoded) || decoded.startsWith("//")) return null;
    const logical = appPathname(new URL(decoded, "https://one-g.invalid").pathname);
    if (logical.startsWith("//") || logical === BASE_PATH || logical.startsWith(`${BASE_PATH}/`)) return null;
    return logical;
  } catch { return null; }
}
