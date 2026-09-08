export function formatPrice(price?: number): string {
  return price === undefined || !Number.isFinite(price) ? "获取报价" : `¥ ${price.toLocaleString("zh-CN")}`;
}

/** A total containing an unpriced item requires a quote; do not understate it. */
export function sumPrices(prices: Array<number | undefined>): number | undefined {
  return prices.some(price => price === undefined || !Number.isFinite(price))
    ? undefined : (prices as number[]).reduce((sum, price) => sum + price, 0);
}
