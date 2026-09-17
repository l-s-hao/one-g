import type { Product } from "@/types/product";
import type { ConfiguratorSchema } from "@/types/configuration";
import { configuratorRegistry } from "@/data/configuration/registry";
import { getProductPolicy } from "@/lib/product-policy";
import { getConfigurationProduct, isConfigurationPreview } from "./policy";

export const getConfigurePath = (schema: ConfiguratorSchema) => `/configure/${schema.id}`;
export function getProductConfigurator(product: Product) {
  return Object.values(configuratorRegistry).find(schema => schema.productId === product.id) ??
    Object.values(configuratorRegistry).find(schema => !schema.productId && schema.productType === product.category &&
      schema.groups.some(group => group.options.some(option => option.productId === product.id)));
}
export function getProductActions(product: Product) {
  const schema = getProductConfigurator(product);
  const policy = getProductPolicy(product);
  return { ...policy, canConfigure: !!schema, configurePath: schema ? getConfigurePath(schema) : undefined,
    configurationLabel: schema && isConfigurationPreview(schema) ? "配置预览" : policy.configurationLabel };
}
export function getConfigurationEntries() {
  return Object.values(configuratorRegistry).flatMap(schema => {
    const product = getConfigurationProduct(schema);
    return product ? [{ schema, product, href: getConfigurePath(schema), ...getProductActions(product) }] : [];
  });
}
