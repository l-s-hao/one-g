import type { Product } from "@/types/product";
import { getProductPolicy } from "./product-policy";

/** System overview navigation; independent of the retired configuration registry. */
export function getProductActions(product: Product) {
  const canConfigure = product.category === "robot" || ["robotdock", "sonic-link"].includes(product.id);
  return { ...getProductPolicy(product), canConfigure, configurePath: canConfigure ? "/configure" : undefined, configurationLabel: "查看系统配置" };
}
