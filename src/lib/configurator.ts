import { configurationOptions, configurationSteps, defaultConfiguration } from "@/data/configurator";
import type { ConfigurationCategory, ConfigurationOption, RobotConfiguration } from "@/types/configuration";
import { getProductsByCategory } from "./products";
import { sumPrices } from "./pricing";

export function getConfigurationSteps() { return configurationSteps; }
export function getConfigurationOptions(category?: ConfigurationCategory): ConfigurationOption[] {
  const base: ConfigurationOption[] = getProductsByCategory("robot").map(product => ({
    id: product.id, name: product.name, price: product.price, category: "base", status: product.status,
    legacyNames: [product.name],
  }));
  return [...base, ...configurationOptions].filter(option => option.status !== "draft" && (!category || option.category === category));
}
export function getOption(id: string | null) { return getConfigurationOptions().find(option => option.id === id); }
export function getInitialConfiguration(): RobotConfiguration { return structuredClone(defaultConfiguration); }
export function getSelectedIds(selection: RobotConfiguration, field: keyof RobotConfiguration): string[] {
  const value = selection[field];
  return Array.isArray(value) ? value : value ? [value] : [];
}
export function getConfigurationRows(selection: RobotConfiguration) {
  return getConfigurationSteps().map(step => {
    const ids = getSelectedIds(selection, step.field);
    return {
      label: step.name,
      value: ids.map(id => getOption(id)?.name ?? "选项已下架").join("、") || "未选择",
      price: step.category === "base" && !ids.length ? undefined : sumPrices(ids.map(id => getOption(id)?.price)),
    };
  });
}
export function getConfigurationTotal(selection: RobotConfiguration) { return sumPrices(getConfigurationRows(selection).map(row => row.price)); }

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
