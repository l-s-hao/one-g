import { readDemoSession } from "./auth-client";
import type { CartItem, CartProduct } from "@/types/cart";
import type { ConfigurationSnapshot } from "@/types/configuration";
import { getProductById } from "./products";
import { robotSchema } from "@/data/configuration/schemas/robot";
import { readConfiguration, removeConfiguration } from "./configuration/storage";
import { getConfigurationProduct } from "./configuration/policy";
import { getProductPolicy } from "./product-policy";
import { sumPrices } from "./pricing";

// Browser-only prototype adapter. No user, payment or order data is transmitted.
function readJSON(key: string): unknown {
  try { return JSON.parse(window.localStorage.getItem(key) ?? "null"); } catch { return null; }
}
export function parseCart(raw: unknown): CartProduct[] {
  if (!Array.isArray(raw)) return [];
  const items = new Map<string, CartProduct>();
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const id = item.productId ?? item.id;
    const product = typeof id === "string" ? getProductById(id) : undefined;
    if (!product || !getProductPolicy(product).canAddToCart || !Number.isSafeInteger(item.quantity) || item.quantity < 1) continue;
    const quantity = (items.get(product.id)?.quantity ?? 0) + item.quantity;
    if (Number.isSafeInteger(quantity)) items.set(product.id, { ...product, quantity });
  }
  return [...items.values()];
}
export function assertCartOwner(userId: string) {
  const user = readDemoSession();
  if (!userId || user?.id !== userId || user.role !== "USER") throw new Error("请先登录当前用户。");
}
export async function readCart(userId: string) { assertCartOwner(userId); return parseCart(readJSON(`one-g-cart:${userId}`)); }
export function writeCart(items: CartProduct[], userId: string) {
  assertCartOwner(userId);
  const records: CartItem[] = items.map(item => ({ productId: item.id, quantity: item.quantity }));
  window.localStorage.setItem(`one-g-cart:${userId}`, JSON.stringify(records));
}
export async function addCartProduct(productId: string, userId: string, quantity = 1) {
  assertCartOwner(userId);
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 999) throw new Error("数量无效");
  const product = getProductById(productId);
  if (!product || !getProductPolicy(product).canAddToCart || product.price === undefined) throw new Error("商品暂不可购买");
  const items = await readCart(userId);
  const existing = items.find(item => item.id === productId);
  if (existing) existing.quantity += quantity;
  else items.push({ ...product, quantity });
  writeCart(items, userId);
}
export async function readSavedConfiguration(userId: string) {
  assertCartOwner(userId);
  const snapshot = (await readConfiguration(robotSchema, userId))?.snapshot;
  // Keep captured names/prices; only current sale eligibility may block a stored purchase.
  if (!snapshot) return null;
  const product = snapshot.productId ? getProductById(snapshot.productId) : getConfigurationProduct(robotSchema, snapshot.selections);
  if (!getProductPolicy(product).canAddToCart) return null;
  return snapshot;
}
export function removeSavedConfiguration(userId: string) { assertCartOwner(userId); removeConfiguration(robotSchema, userId); }
export function getCartTotal(items: CartProduct[], configuration: ConfigurationSnapshot | null) {
  return sumPrices([
    ...items.map(item => item.price === undefined ? undefined : item.price * item.quantity),
    ...(configuration ? [configuration.price] : []),
  ]);
}
