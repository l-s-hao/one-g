import { solutions } from "./solutions";

export type DirectoryLink = { href: string; label: string };
export type NavigationGroup = { label: string; links: DirectoryLink[] };
export type NavigationItem = DirectoryLink & { groups?: NavigationGroup[] };

export const productLinks: DirectoryLink[] = [
  { href: "/products/robotdock", label: "RoboDock" },
];
export const shopLinks: DirectoryLink[] = [
  { href: "/products", label: "全部商品" },
  { href: "/products?category=robot", label: "机器人" },
  { href: "/products?category=arm", label: "机械臂" },
  { href: "/products?category=hand", label: "灵巧手" },
  { href: "/products?category=vision", label: "视觉系统" },
];
export const solutionLinks = solutions.map(item => ({ href: item.detailHref ?? `/solutions#${item.id}`, label: item.content ? `${item.name} · ${item.content.name}` : item.name }));
export const navigation: NavigationItem[] = [
  { href: "/products", label: "商品中心", groups: [{ label: "", links: [shopLinks[0], ...productLinks, ...shopLinks.slice(1)] }] },
  { href: "/solutions", label: "解决方案", groups: [{ label: "面向真实任务", links: solutionLinks }] },
  { href: "/about", label: "了解公司" },
];
