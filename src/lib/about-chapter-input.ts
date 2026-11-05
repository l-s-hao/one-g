export const normalizeChapter = (index: number, count: number) => ((Math.round(index) % count) + count) % count;
export function contentCanScroll(top: number, height: number, viewport: number, delta: number) {
  return delta > 0 ? top < Math.max(0, height - viewport) - 2 : top > 2;
}
export type BoundaryGesture = { last: number; direction: number; amount: number; used: boolean };
// 只由实际输入调用：布局变化和 scroll 事件不增加边界意图。减速尾流没有新静默间隔就不能再次翻章。
export function boundaryIntent(g: BoundaryGesture, delta: number, now: number, fresh = false) {
  const direction = Math.sign(delta);
  if (fresh || now - g.last > 220 || direction !== g.direction) { g.amount = 0; g.used = false; }
  g.last = now; g.direction = direction;
  if (g.used) return false;
  g.amount += Math.min(Math.abs(delta), 80);
  return g.amount >= 64;
}
