import { configurationOptions, configurationSteps } from "@/data/configurator";
import type { ConfigurationCategory, RobotConfigurationOption, RobotConfiguration } from "@/types/configuration";
import { getProductsByCategory } from "./products";

export function getConfigurationOptions(category?: ConfigurationCategory): RobotConfigurationOption[] {
  const base: RobotConfigurationOption[] = getProductsByCategory("robot").map(product => ({
    id: product.id, name: product.name, price: product.price, groupId: "base", category: "base", status: product.status,
    legacyNames: [product.name],
  }));
  return [...base, ...configurationOptions].filter(option => option.status !== "draft" && (!category || option.category === category));
}
export function getOption(id: string | null) { return getConfigurationOptions().find(option => option.id === id); }
/** Accept version-one name-based local data without trusting stored prices. */
export function parseConfiguration(raw: unknown): RobotConfiguration | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;
  const legacyKeys = ["基础型号", "机械臂", "灵巧手", "视觉系统", "功能"];
  const result: RobotConfiguration = { baseRobotId: null, armId: null, handId: null, visionIds: [], capabilityIds: [] };
  for (const [index, step] of configurationSteps.entries()) {
    const value = record[step.field] ?? record[legacyKeys[index]];
    const values = Array.isArray(value) ? value : [value];
    const available = getConfigurationOptions(step.category);
    const ids = [...new Set(values.flatMap(value => {
      if (typeof value !== "string") return [];
      const option = available.find(option => option.id === value || option.legacyNames?.includes(value));
      return option ? [option.id] : [];
    }))];
    if (step.field === "visionIds" || step.field === "capabilityIds") result[step.field] = ids;
    else result[step.field] = ids[0] ?? null;
  }
  return result.baseRobotId ? result : null;
}
