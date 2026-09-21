import { productLinks, shopLinks, solutionLinks } from "./site-navigation";

export type FooterItem = { label: string; href: string; action?: never } | { label: string; action: "accessibility"; href?: never };
export const footerGroups: { title: string; items: FooterItem[] }[] = [
  { title: "产品与配置", items: [...productLinks, { label: "产品选购", href: "/" }] },
  { title: "商品选购", items: shopLinks },
  { title: "解决方案", items: [...solutionLinks, { label: "深度定制", href: "/deep-customization" }] },
  { title: "账户与服务", items: [
    { label: "用户中心", href: "/account" }, { label: "购物车", href: "/cart" },
    { label: "客服咨询", href: "#one-g-contact" }, { label: "显示辅助", action: "accessibility" },
  ] },
  { title: "关于 ONE-G", items: [{ label: "了解公司", href: "/about" }, { label: "联系 ONE-G", href: "#one-g-contact" }] },
];
