import { solutions } from "./solutions";

export type DirectoryLink = { href: string; label: string };
export type NavigationGroup = { label: string; links: DirectoryLink[] };
export type NavigationItem = DirectoryLink & { groups?: NavigationGroup[] };

export const productLinks: DirectoryLink[] = [
  { href: "/products/robotdock", label: "RobotDock" },
  { href: "/products/sonic-link", label: "SONIC Link" },
];
export const shopLinks: DirectoryLink[] = [
  { href: "/products", label: "全部商品" },
  { href: "/products?category=robot", label: "机器人" },
  { href: "/products?category=arm", label: "机械臂" },
  { href: "/products?category=hand", label: "灵巧手" },
  { href: "/products?category=vision", label: "视觉系统" },
];
export const solutionLinks = solutions.map(item => ({ href: `/solutions#${item.id}`, label: item.name }));
export const navigation: NavigationItem[] = [
  { href: "/solutions", label: "解决方案", groups: [{ label: "面向真实任务", links: solutionLinks }] },
  { href: "/products", label: "商品中心", groups: [{ label: "商品选购", links: shopLinks }] },
  { href: "/about", label: "了解公司" },
];
