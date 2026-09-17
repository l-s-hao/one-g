import type { ConfigurationState, ConfiguratorSchema } from "@/types/configuration";
import { getProductById } from "@/lib/products";
import { getProductPolicy } from "@/lib/product-policy";

/** Direct product relation or the selected Product-backed platform; no product name checks. */
export function getConfigurationProduct(schema: ConfiguratorSchema, selections: ConfigurationState = schema.defaults) {
  const productId = schema.productId ?? schema.groups.flatMap(group => group.options.filter(option =>
    option.productId && selections[group.id]?.includes(option.id)
  )).find(option => option.productId)?.productId;
  return productId ? getProductById(productId) : undefined;
}

/** Preview permission is distinct from catalog sale status. Missing linked products fail closed. */
export function isConfigurationPreview(schema: ConfiguratorSchema) {
  return schema.purchaseMode === "preview" || (!!schema.productId && !getProductPolicy(getProductById(schema.productId)).canAddToCart);
}
