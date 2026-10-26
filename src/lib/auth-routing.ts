import { localAppPathname } from "./route-paths";
import type { UserRole } from "@/types/auth";
import { canonicalConfigurationHref } from "./configuration-routing";

const USER_ROUTE_ROOTS = ["/cart", "/checkout", "/orders", "/account", "/order-success"];
const LOGIN_ROUTES = new Set(["/login", "/admin/login", "/register"]);

export function requiredRole(href: string): UserRole | null {
  if (!href.startsWith("/") || href.startsWith("//")) return null;
  const logical = localAppPathname(href.split(/[?#]/, 1)[0]);
  if (logical === null) return null;
  const pathname = logical.replace(/\/+$/, "") || "/";
  if (LOGIN_ROUTES.has(pathname)) return null;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return "ADMIN";
  return USER_ROUTE_ROOTS.some(root => pathname === root || pathname.startsWith(`${root}/`)) ? "USER" : null;
}

export function canAccessRole(role: UserRole, required: UserRole) {
  return role === required;
}

export function loginDestination(target: string, role: UserRole = "USER") {
  return `/login?returnTo=${encodeURIComponent(safeReturnTo(canonicalConfigurationHref(target), role))}`;
}

// returnTo is untrusted URL input. Allow only local, role-compatible destinations,
// never external URLs, login loops or encoded slash/backslash URL tricks.
export function safeReturnTo(value: string | null, role: UserRole): string {
  const fallback = role === "ADMIN" ? "/admin" : "/account";
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020]/.test(value)) return fallback;
  try {
    const url = new URL(value, "https://one-g.invalid");
    if (url.origin !== "https://one-g.invalid") return fallback;
    const logical = localAppPathname(url.pathname);
    if (logical === null) return fallback;
    const normalized = logical.replace(/\/+$/, "") || "/";
    if (LOGIN_ROUTES.has(normalized)) return fallback;
    const needed = requiredRole(normalized);
    if (needed && !canAccessRole(role, needed)) return fallback;
    return canonicalConfigurationHref(`${logical}${url.search}${url.hash}`);
  } catch { return fallback; }
}
