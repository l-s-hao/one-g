// A short-lived hint only. Never executes a cart mutation and never contains credentials.
const key = "one-g-pending-cart-action";
const ttl = 15 * 60 * 1000;
export function rememberCartIntent(productId: string, pathname: string) {
  try { sessionStorage.setItem(key, JSON.stringify({ action: "add-to-cart", productId, pathname, createdAt: Date.now() })); } catch { /* Return navigation still works without storage. */ }
}
export function consumeCartIntent(productId: string, pathname: string) {
  try {
    const raw: unknown = JSON.parse(sessionStorage.getItem(key) ?? "null");
    if (!raw || typeof raw !== "object" || !("createdAt" in raw) || typeof raw.createdAt !== "number" || Date.now() - raw.createdAt > ttl || raw.createdAt > Date.now()) { sessionStorage.removeItem(key); return false; }
    if (!("action" in raw) || raw.action !== "add-to-cart" || !("productId" in raw) || raw.productId !== productId || !("pathname" in raw) || raw.pathname !== pathname) return false;
    sessionStorage.removeItem(key);
    return true;
  } catch { return false; }
}
