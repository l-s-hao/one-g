import type { CatalogStatus, Product } from "@/types/product";

const labels: Record<CatalogStatus, string> = {
  draft: "草稿", active: "可配置", concept: "概念产品 · 配置预览", "coming-soon": "即将开放",
};
export const getProductStatusLabel = (status: CatalogStatus) => labels[status];
export function getProductPolicy(product: Pick<Product, "status"> | undefined) {
  const canAddToCart = product?.status === "active";
  return {
    canAddToCart,
    canRequestQuote: !!product && product.status !== "draft",
    configurationLabel: canAddToCart ? "开始配置" : "配置预览",
    saveLabel: canAddToCart ? "保存配置" : "保存配置预览",
  };
}
