export interface Solution {
  id: string;
  name: string;
  category: "execution" | "remote" | "perception" | "intelligence";
  problem: string;
  media: { src: string; alt: string; caption: string; width: number; height: number };
  subtitle: string;
  description: string;
  capabilities: string[];
  productIds: string[];
  boundary: string;
}
