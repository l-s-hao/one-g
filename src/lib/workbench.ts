import { getConfigurationOptions, getConfigurationSteps, getSelectedIds } from "./configurator";
import { getCoreProduct, getProductById } from "./products";
import type { ConfigurationOption, RobotConfiguration } from "@/types/configuration";

export function getWorkbenchGroups() {
  return getConfigurationSteps().map(step => ({ ...step, options: getConfigurationOptions(step.category) }));
}
export function isInstalled(configuration: RobotConfiguration, option: ConfigurationOption) {
  const group = getConfigurationSteps().find(group => group.category === option.category);
  return !!group && getSelectedIds(configuration, group.field).includes(option.id);
}
export function changeModule(configuration: RobotConfiguration, option: ConfigurationOption, remove = false): RobotConfiguration {
  const group = getConfigurationSteps().find(group => group.category === option.category);
  if (!group) return configuration;
  const field = group.field;
  if (field === "visionIds" || field === "capabilityIds") {
    return { ...configuration, [field]: remove ? configuration[field].filter(id => id !== option.id) : [...new Set([...configuration[field], option.id])] };
  }
  return { ...configuration, [field]: remove ? null : option.id };
}

/** Reserved Mock contract: compatibleWith, if supplied, lists supported base robot IDs.
 * No fixtures currently declare compatibility. Unknown is not a claim of verified compatibility.
 */
export function getAvailability(option: ConfigurationOption, configuration: RobotConfiguration) {
  if (option.status !== "active") return { available: false, label: "暂不可用" };
  if (option.category === "base" || option.compatibleWith === undefined) return { available: true, label: "兼容关系待确认" };
  if (!configuration.baseRobotId) return { available: false, label: "请先选择基础平台" };
  return option.compatibleWith.includes(configuration.baseRobotId)
    ? { available: true, label: "可用" }
    : { available: false, label: "不兼容当前平台" };
}

export function getWorkbenchPreview(baseRobotId: string | null) {
  const product = baseRobotId ? getProductById(baseRobotId) : undefined;
  const fallback = getCoreProduct();
  return {
    name: product?.name ?? "请选择基础平台",
    image: product?.images[0] ?? fallback?.images[0],
    imageAlt: product?.showcase?.imageAlt ?? "现有机器人产品图，仅为装配示意，非组合渲染",
    placeholder: !product?.images[0] || !!product.showcase,
  };
}
