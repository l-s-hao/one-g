/** Product identity only: facts, media and package contents remain in canonical Product data. */
export const configurableOfferings = [
  { productId: "robotdock", anchor: "robotdock", heroImageIndex: 0 },
  { productId: "sonic-link", anchor: "sonic-link", heroImageIndex: 0 },
] as const;
export function isConfigurableOffering(productId: string) {
  return configurableOfferings.some(offering => offering.productId === productId);
}
