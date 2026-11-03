import { solutions } from "@/data/solutions";

/** 仅决定本页阅读顺序；引用原方案对象，不重排共享集合或改变导航、首页的稳定 ID。 */
export const solutionSectionIds = ["teleoperation", "handling", "inspection", "ai"] as const;
export const solutionSections = solutionSectionIds.map(id => {
  const solution = solutions.find(item => item.id === id);
  if (!solution) throw new Error(`Missing solution section: ${id}`);
  return solution;
});

export const sectionDemos: Readonly<Partial<Record<string, readonly string[]>>> = {
  teleoperation: ["wholebody-balance"],
  handling: ["wholebody-pick"],
  ai: ["dance-video-motion", "music-motion"],
};
