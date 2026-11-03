/** 部署配置与客户端共用前缀，避免静态托管和旧入口迁移各自拼出不同路径。 */
export const BASE_PATH = "/one-g";
export function appPathname(pathname: string): string {
  return pathname === BASE_PATH ? "/" : pathname.startsWith(`${BASE_PATH}/`) ? pathname.slice(BASE_PATH.length) : pathname;
}

/** 不可信路径只解码一次，再按 URL 规则折叠点段；拒绝残留编码、反斜杠和重复前缀，防止权限分类与路由目标不同。 */
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
