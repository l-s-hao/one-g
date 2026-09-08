import type { Product } from "./product";
export interface CartItem { productId: string; quantity: number }
export type CartProduct = Product & { quantity: number };
