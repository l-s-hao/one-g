import type { CatalogStatus } from "./product";

export interface Capability {
  id: string;
  name: string;
  englishName: string;
  description: string;
  image: string;
  imageAlt: string;
  status: CatalogStatus;
}

export interface BrandAdvantage {
  id: string;
  name: string;
  englishName: string;
  description: string;
}
