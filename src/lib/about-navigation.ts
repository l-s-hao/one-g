import { getProductById } from "@/lib/products";
import { getOfferingNavigation } from "@/lib/offering-navigation";
import { shopLinks, navigation } from "@/data/site-navigation";
import { solutions } from "@/data/solutions";

const dock = getProductById("robotdock");
const teleoperation = solutions.find(item => item.id === "teleoperation");
const robots = shopLinks.find(item => item.href === "/products?category=robot");
if (!dock || !teleoperation?.detailHref || !robots) throw new Error("Missing About navigation target");

// 入口引用现有商品、方案和分类配置；展示名称翻译不参与 URL 生成。
export const aboutNavigation = {
  dock: getOfferingNavigation(dock).overviewHref,
  teleoperation: teleoperation.detailHref,
  teleoperationSection: `/solutions#${teleoperation.id}`,
  robots: robots.href,
  products: shopLinks[0].href,
  solutions: navigation.find(item => item.href === "/solutions")!.href,
  platformRoute: "/about#platform-route",
};
