// 已允许公开的章节。实践案例尚未核实，不生成正文或空目录入口。
export const aboutChapters = [
  { id: "company-introduction", zh: "公司介绍", en: "Company", published: true, anchors: ["company-introduction", "about-hero-title"] },
  { id: "our-vision", zh: "愿景定位", en: "Vision", published: true, anchors: ["our-vision", "vision-title"] },
  { id: "platform-route", zh: "平台路线", en: "Platform approach", published: true, anchors: ["platform-route", "route-title", "our-positioning", "integration-layer", "positioning-title"] },
  { id: "capabilities", zh: "产品与能力", en: "Products & capabilities", published: true, anchors: ["capabilities", "capabilities-title", "media-sources"] },
  { id: "contact", zh: "联系万机", en: "Contact ONE-G", published: true, anchors: ["contact", "contact-title", "platform-direction", "direction-title"] },
] as const;
export type AboutChapterId = typeof aboutChapters[number]["id"];
export const publishedAboutChapters = aboutChapters.filter(chapter => chapter.published);
export function aboutChapterIndex(hash: string) {
  return publishedAboutChapters.findIndex(chapter => (chapter.anchors as readonly string[]).includes(hash.replace(/^#/, "")));
}
