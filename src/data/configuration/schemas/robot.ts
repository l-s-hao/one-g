import { configurationOptions, defaultConfiguration } from "@/data/configurator";
import { robotScenes, robotScopes } from "@/data/configuration/robot-entry";
import { sceneRecommendations } from "@/data/recommendations";
import { getProductsByCategory } from "@/lib/products";
import { robotConfigurationToGeneric } from "@/lib/configuration/adapters";
import type { ConfigurationGroup, ConfiguratorSchema } from "@/types/configuration";

const definitions: Omit<ConfigurationGroup, "options" | "order">[] = [
  { id: "base", label: "基础平台", heading: "BASE PLATFORM", shortLabel: "BASE", icon: "box", selectionMode: "single", required: true, slotLayout: "full", rowWeight: 1.1, installedLabel: "✓ 已选择基础平台" },
  { id: "arm", label: "机械臂", heading: "ARM", slotLabel: "机械臂插槽", icon: "box", selectionMode: "single", required: false, rowWeight: 1 },
  { id: "hand", label: "末端执行器", heading: "END EFFECTOR", slotLabel: "末端执行器插槽", icon: "hand", selectionMode: "single", required: false, description: "灵巧手与夹爪共用一个插槽，选择后互相替换。" },
  { id: "vision", label: "视觉系统", navigationLabel: "感知系统", heading: "PERCEPTION", icon: "eye", selectionMode: "multiple", required: false, rowWeight: 1.05 },
  { id: "capability", label: "功能能力", heading: "CAPABILITY", icon: "cpu", selectionMode: "multiple", required: false },
];
export const robotSchema: ConfiguratorSchema = {
  id: "robot", productType: "robot", title: "ONE-G", description: "选择基础平台、执行机构、感知与功能模块。", entryHref: "/configure", cartLabel: "机器人配置",
  defaults: robotConfigurationToGeneric(defaultConfiguration),
  groups: definitions.map((group, order) => ({ ...group, order, progressWeight: 1,
    options: group.id === "base" ? getProductsByCategory("robot").map(product => ({ id: product.id, groupId: group.id, productId: product.id, name: product.name, status: product.status }))
      : configurationOptions.filter(option => option.category === group.id).map(option => ({ id: option.id, groupId: group.id, name: option.name, price: option.price, status: option.status, description: option.description, omitted: ["no-arm", "no-hand"].includes(option.id) })),
  })),
  scenes: robotScenes.map(scene => ({ ...scene, preferredGroup: scene.preferredCategory })),
  scopes: robotScopes.map(scope => ({ id: scope.id, groupId: scope.category, english: scope.english })),
  recommendations: sceneRecommendations,
  compatibilityRules: configurationOptions.flatMap(option => option.compatibleWith === undefined ? [] : [{ type: "allowedOptions" as const, option: { groupId: option.category, optionId: option.id }, groupId: "base", optionIds: option.compatibleWith }]),
};
