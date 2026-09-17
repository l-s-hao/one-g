export type ProductCategory = "robot" | "arm" | "hand" | "vision" | "accessory";
export type CatalogStatus = "draft" | "active" | "coming-soon" | "concept";

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
  specifications?: { label: string; value: string; note?: string }[];
  detail?: ProductDetailContent;
  showcase?: { titleLines: string[]; descriptionLines: string[]; eyebrow: string; imageAlt: string };
}

export interface Category { id: ProductCategory; name: string }

/** Editorial product information; bundles here are previews, not selectable configurations. */
export interface ProductDetailContent {
  statusNote: string;
  /** Ordered editorial sections, independent of configuration selections. */
  sections?: {
    id: string; eyebrow: string; title: string; paragraphs?: string[];
    cards?: { title: string; description: string; items?: string[] }[];
    media?: { src: string; alt: string; caption: string; width: number; height: number }[];
    link?: { href: string; label: string };
  }[];
  imageNotes: { alt: string; caption: string; width: number; height: number }[];
  highlights?: { title: string; description: string }[];
  interfaces?: string[];
  interfaceNote?: string;
  compatibility?: { name: string; status: string; description: string }[];
  compatibilityNote?: string;
  addOns?: { id: string; name: string; description: string; items: string[] }[];
  bundles: { id: string; name: string; description: string; items: string[] }[];
  bundleNote?: string;
}
