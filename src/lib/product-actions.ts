import type { Product } from "@/types/product";
import { getProductPolicy } from "./product-policy";

/** System overview navigation; independent of the retired configuration registry. */
export function getProductActions(product: Product) {
  const canConfigure = product.category === "robot" || ["robotdock"].includes(product.id);
  return { ...getProductPolicy(product), canConfigure, configurePath: canConfigure ? (["robotdock"].includes(product.id) ? `/buy/${product.slug}` : "/") : undefined, configurationLabel: ["robotdock"].includes(product.id) ? "购买" : "查看系统配置" };
}
