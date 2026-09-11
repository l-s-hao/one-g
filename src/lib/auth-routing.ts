import type { UserRole } from "@/types/auth";

const PUBLIC_ROUTES = new Set(["/", "/about", "/login", "/admin/login"]);
const LOGIN_ROUTES = new Set(["/login", "/admin/login"]);

export function requiredRole(href: string): UserRole | null {
  if (!href.startsWith("/") || href.startsWith("//")) return null;
  const pathname = href.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";
  if (PUBLIC_ROUTES.has(pathname)) return null;
  return pathname === "/admin" || pathname.startsWith("/admin/") ? "ADMIN" : "USER";
}

export function canAccessRole(role: UserRole, required: UserRole, href: string) {
  const pathname = href.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";
  return role === required || (role === "ADMIN" && required === "USER" && pathname === "/account");
}

export function loginDestination(target: string, role: UserRole = "USER") {
  return `${role === "ADMIN" ? "/admin/login" : "/login"}?returnTo=${encodeURIComponent(target)}`;
}

// returnTo is untrusted URL input. Allow only local, role-compatible destinations,
// never external URLs, login loops or encoded slash/backslash URL tricks.
export function safeReturnTo(value: string | null, role: UserRole): string {
  const fallback = role === "ADMIN" ? "/admin" : "/account";
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020]/.test(value)) return fallback;
  try {
    const url = new URL(value, "https://one-g.invalid");
    const decoded = decodeURIComponent(url.pathname);
    if (url.origin !== "https://one-g.invalid" || /[\\\u0000-\u0020]/.test(decoded) || decoded.startsWith("//") || decoded.includes("%")) return fallback;
    const normalized = new URL(decoded, "https://one-g.invalid").pathname.replace(/\/+$/, "") || "/";
    if (LOGIN_ROUTES.has(normalized)) return fallback;
    const needed = requiredRole(normalized);
    if (needed && !canAccessRole(role, needed, normalized)) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return fallback; }
}
