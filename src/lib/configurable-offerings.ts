import { configurableOfferings } from "@/data/configurable-offerings";
import { getProductById } from "./products";
export function getConfigurableOfferings() {
  return configurableOfferings.map(offering => {
    const product = getProductById(offering.productId);
    if (!product?.detail) throw new Error(`Missing offering content: ${offering.productId}`);
    return { ...offering, product, detail: product.detail };
  });
}
/** Editorial package views, never a configuration state or independently copied product record. */
export function getOfferingPackages() {
  return getConfigurableOfferings().map(offering => ({ ...offering, packages: offering.detail.bundles }));
}
