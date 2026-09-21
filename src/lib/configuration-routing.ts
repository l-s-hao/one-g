import { getOfferingPackages } from "./configurable-offerings";

/** Static-export compatibility. Only known product/package IDs survive migration. */
export function canonicalConfigurationHref(href: string) {
  const url = new URL(href, "https://one-g.invalid");
  const path = url.pathname.replace(/\/+$/, "");
  if (!["/configure", "/customize", "/customize/start", "/configure/robot", "/configure/robotdock", "/configure/sonic-link"].includes(path)) return href;
  const offerings = getOfferingPackages();
  const pathProduct = offerings.find(({ product }) => path === `/configure/${product.id}`);
  const requested = url.searchParams.get("productId") ?? url.searchParams.get("product") ?? url.hash.slice(1);
  const offering = pathProduct ?? offerings.find(({ product, anchor }) => product.id === requested || anchor === requested);
  if (!offering) return "/";
  const requestedPackage = url.searchParams.get("package") ?? url.searchParams.get("bundle") ?? url.searchParams.get("packageId") ?? url.searchParams.get("bundleId");
  const bundle = offering.packages.find(item => item.id === requestedPackage);
  return `/buy/${offering.product.slug}${bundle ? `?package=${encodeURIComponent(bundle.id)}` : ""}`;
}
