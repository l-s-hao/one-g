import { configurableOfferings } from "@/data/configurable-offerings";
import type { Product } from "@/types/product";

/** Public editorial and package links. Never a checkout or cart action. */
export function getOfferingNavigation(product: Product) {
  const offering = configurableOfferings.find(item => item.productId === product.id);
  if (!offering) throw new Error(`Not a configurable offering: ${product.id}`);
  const overviewHref = `/products/${product.slug}`;
  return {
    overviewHref,
    specsHref: `${overviewHref}/specs`,
    purchaseHref: `/buy/${product.slug}`,
    purchaseLabel: "购买",
  };
}

// Presentation groups refer to existing field labels; values remain in Product.
const specificationGroups = [
  { title: "外形与安装", labels: ["安装方式", "换装方式", "尺寸 / 重量"] },
  { title: "接口与供电", labels: ["通信接口", "供电能力", "软件接口"] },
  { title: "支持设备与系统要求", labels: ["目标平台", "动作采集", "软件模式", "末端设备", "运行环境"] },
  { title: "交付与销售状态", labels: ["交付范围", "价格 / 交付", "价格 / 销售"] },
];
export function getOfferingSpecificationGroups(product: Product) {
  const fields = product.specifications ?? [];
  const groups = specificationGroups.map(group => ({ title: group.title, fields: fields.filter(field => group.labels.includes(field.label)) }));
  const other = fields.filter(field => !specificationGroups.some(group => group.labels.includes(field.label)));
  if (other.length) groups.push({ title: "其它规格", fields: other });
  return groups.filter(group => group.fields.length);
}
