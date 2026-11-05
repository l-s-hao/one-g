/** 只供明确用户操作调用；受控prop回读不能走这里，避免程序同步时自动开声。 */
export function applyUserVolume(media: Pick<HTMLMediaElement, "volume" | "muted">, percent: number) {
  if (!Number.isFinite(percent)) return false;
  const wanted = Math.min(100, Math.max(0, percent)) / 100;
  try {
    media.volume = wanted;
    // 部分移动平台忽略网页volume写入：保留真实值及静音，不展示假音量。
    if (Math.abs(media.volume - wanted) > 0.000001) return false;
    media.muted = wanted === 0;
    return true;
  } catch { return false; }
}
