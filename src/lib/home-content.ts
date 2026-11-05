import { getProductById } from "@/lib/products";
import { getOfferingNavigation } from "@/lib/offering-navigation";
import { shopLinks, navigation } from "@/data/site-navigation";
import { solutions } from "@/data/solutions";
import { solutionDemos } from "@/data/solution-demos";

// 首页只做编辑选择，不复制价格、名称或商品状态；普通型号的预览边界沿用现有详情页。
export function getHomeContent() {
  const dock = getProductById("robotdock");
  const teleoperation = solutions.find(item => item.id === "teleoperation");
  if (!dock?.detail || !teleoperation?.detailHref) throw new Error("Missing homepage offering");
  const demo = solutionDemos.find(item => item.id === "wholebody-balance");
  return {
    dock, dockHref: getOfferingNavigation(dock).overviewHref,
    products: ["g1", "arm-a1"].flatMap(id => {
      const product = getProductById(id);
      return product?.images[0] ? [{ product, href: `/products/${product.slug}` }] : [];
    }),
    // 分类按已有URL识别，不依据翻译文字生成参数，也不导入仍留在底层的accessory枚举。
    categories: [...shopLinks.slice(1), shopLinks[0]],
    teleoperation, demo,
    scenes: ["handling", "inspection", "ai"].flatMap(id => {
      const solution = solutions.find(item => item.id === id);
      return solution ? [{ solution, href: solution.detailHref ?? `/solutions#${solution.id}` }] : [];
    }),
    aboutHref: navigation.find(item => item.href === "/about")!.href,
    productsHref: shopLinks[0].href,
    solutionsHref: navigation.find(item => item.href === "/solutions")!.href,
  };
}
