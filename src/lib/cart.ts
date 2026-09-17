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
export async function readCart() { return parseCart(readJSON("one-g-cart")); }
export function writeCart(items: CartProduct[]) {
  const records: CartItem[] = items.map(item => ({ productId: item.id, quantity: item.quantity }));
  window.localStorage.setItem("one-g-cart", JSON.stringify(records));
}
export async function addCartProduct(productId: string) {
  const product = getProductById(productId);
  if (!product || !getProductPolicy(product).canAddToCart) return;
  const items = await readCart();
  const existing = items.find(item => item.id === productId);
  if (existing) existing.quantity += 1;
  else items.push({ ...product, quantity: 1 });
  writeCart(items);
}
export async function readSavedConfiguration() {
  const snapshot = (await readConfiguration(robotSchema))?.snapshot;
  // Keep captured names/prices; only current sale eligibility may block a stored purchase.
  if (!snapshot) return null;
  const product = snapshot.productId ? getProductById(snapshot.productId) : getConfigurationProduct(robotSchema, snapshot.selections);
  if (!getProductPolicy(product).canAddToCart) return null;
  return snapshot;
}
export function removeSavedConfiguration() { removeConfiguration(robotSchema); }
export function getCartTotal(items: CartProduct[], configuration: ConfigurationSnapshot | null) {
  return sumPrices([
    ...items.map(item => item.price === undefined ? undefined : item.price * item.quantity),
    ...(configuration ? [configuration.price] : []),
  ]);
}
