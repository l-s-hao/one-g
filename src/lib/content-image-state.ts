export type ContentImageState = "waiting" | "loading" | "loaded" | "failed";
/** complete也包括失败；成功必须有真实像素，离屏等待不播放装饰动画。 */
export function contentImageState(complete: boolean, naturalWidth: number, hasCurrentSource: boolean, visible: boolean, failed = false): ContentImageState {
  if (complete && naturalWidth > 0) return "loaded";
  if (failed || (complete && hasCurrentSource && naturalWidth === 0)) return "failed";
  return visible ? "loading" : "waiting";
}
