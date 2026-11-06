/** 只在搜索打开时订阅；软键盘/缩放可能只改变visualViewport而不改变100dvh。 */
export function trackSearchViewport(element: HTMLElement, edge: "top" | "bottom") {
  const viewport = window.visualViewport;
  const update = () => {
    const bottom = (viewport?.height ?? innerHeight) + (viewport?.offsetTop ?? 0);
    // 顶部面板使用布局位置，不把入场translateY算进软键盘可用高度。
    const parent = element.offsetParent;
    const position = edge === "top" && parent instanceof HTMLElement ? parent.getBoundingClientRect().top + element.offsetTop : element.getBoundingClientRect()[edge];
    const available = Math.max(0, bottom - position - (edge === "bottom" ? 8 : 0));
    const value = `${available}px`;
    if (element.style.getPropertyValue("--search-available-height") !== value) element.style.setProperty("--search-available-height", value);
  };
  update();
  viewport?.addEventListener("resize", update); viewport?.addEventListener("scroll", update);
  window.addEventListener("resize", update); window.addEventListener("scroll", update, { passive: true });
  return () => { viewport?.removeEventListener("resize", update); viewport?.removeEventListener("scroll", update); window.removeEventListener("resize", update); window.removeEventListener("scroll", update); };
}
