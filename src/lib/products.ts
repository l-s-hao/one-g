import { products, categories } from "@/data/products";
import type { ProductCategory } from "@/types/product";

// Phase 1 repository. Only this adapter imports the product fixtures.
export function getProducts() { return products.filter(product => product.status !== "draft"); }
export function getFeaturedProducts() { return getProducts().filter(product => product.featured); }
export function getProductBySlug(slug: string) { return getProducts().find(product => product.slug === slug); }
export function getProductById(id: string) { return getProducts().find(product => product.id === id); }
export function getProductsByCategory(category: ProductCategory) { return getProducts().filter(product => product.category === category); }
export function getCategories() { return categories; }
export function getCategoryName(category: ProductCategory) { return categories.find(item => item.id === category)?.name ?? category; }

export function getCoreProduct() { return getProducts().find(product => product.coreProduct && product.status === "active"); }

/** Homepage: up to three active hardware products with available product imagery. */
export function getMatureHardwareProducts() {
  const hardwareCategories: ProductCategory[] = ["arm", "hand", "vision"];
  return hardwareCategories.flatMap(category => {
    const product = getProductsByCategory(category).find(product => product.status === "active" && product.images.length > 0);
    return product ? [product] : [];
  });
}
