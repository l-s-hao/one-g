export type ProductCategory = "robot" | "arm" | "hand" | "vision" | "accessory";
export type CatalogStatus = "draft" | "active" | "coming-soon";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  subtitle?: string;
  description?: string;
  /** Mock CNY amount. Undefined means a quote is needed, never zero. */
  price?: number;
  images: string[];
  status: CatalogStatus;
  featured?: boolean;
  coreProduct?: boolean;
  showcase?: { titleLines: string[]; descriptionLines: string[]; eyebrow: string; imageAlt: string };
}

export interface Category { id: ProductCategory; name: string }
