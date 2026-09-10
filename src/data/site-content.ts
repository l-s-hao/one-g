// Phase 1 provisional brand copy. Replace here when the official wording is confirmed.
export const siteContent = {
  contactPlaceholder: "联系方式即将公布。",
  footer: {
    brand: "ONE-G / 万机智能",
    copyright: "© ONE-G / 万机智能",
    // Contact and order-history entries remain hidden until their pages exist.
    groups: [
      { title: "商品", links: [
        { label: "商品中心", href: "/products" },
        { label: "机器人", href: "/products?category=robot" },
        { label: "机械臂", href: "/products?category=arm" },
        { label: "灵巧手", href: "/products?category=hand" },
        { label: "视觉系统", href: "/products?category=vision" },
      ] },
      { title: "定制", links: [{ label: "在线定制", href: "/customize/start" }] },
      { title: "公司", links: [{ label: "了解公司", href: "/about" }] },
      { title: "用户", links: [{ label: "用户中心", href: "/account" }, { label: "购物车", href: "/cart" }] },
    ],
  },
  homeClosing: {
    eyebrow: "05 / ABOUT ONE-G",
    companyName: "ONE-G / 万机智能",
    companyDescription: "面向具身智能时代，构建模块化机器人产品与智能能力体系。",
    aboutLink: { label: "了解公司", href: "/about" },
    // Existing project render; not a photo of the team or company premises.
    image: "/one-g/hero/one-g-service.png",
    imageAlt: "ONE-G 官网原型使用的完整服务机器人产品渲染图",
    finalTitle: ["BUILD YOUR", "ONE-G"],
    finalDescription: "从一个基础平台开始，组合适合你的机器人。",
    primaryAction: { label: "开始在线定制", href: "/customize/start" },
    secondaryAction: { label: "查看全部商品", href: "/products" },
  },
};
