import { assemblyBindings } from "@/data/assembly";
import { getCoreProduct, getProductById } from "./products";
import { getOption } from "./configurator";
import type { ConfigurationCategory, RobotConfiguration } from "@/types/configuration";

export interface AssemblyNode {
  id: string;
  name: string;
  category: ConfigurationCategory;
  image?: string;
  label: string;
}
const labels = { base: "BASE", arm: "ARM", hand: "HAND", vision: "VISION", capability: "CAPABILITY" };
const fields: Record<ConfigurationCategory, keyof RobotConfiguration> = {
  base: "baseRobotId", arm: "armId", hand: "handId", vision: "visionIds", capability: "capabilityIds",
};
function getNodes(): AssemblyNode[] {
  return assemblyBindings.flatMap(binding => {
    const option = getOption(binding.optionId);
    const product = binding.productId ? getProductById(binding.productId) : undefined;
    if (!option || option.status !== "active" || (binding.productId && product?.status !== "active")) return [];
    return [{ id: option.id, name: product?.name ?? option.name, category: option.category, image: product?.images[0], label: labels[option.category] }];
  });
}
export function getConfiguratorHardware(): AssemblyNode[] {
  const core = getCoreProduct();
  const base: AssemblyNode[] = core ? [{ id: core.id, name: core.name, category: "base", image: core.images[0], label: labels.base }] : [];
  return [...base, ...getNodes().filter(node => node.category === "arm" || node.category === "hand")];
}
export function getConfiguratorPerception() { return getNodes().filter(node => node.category === "vision"); }
export function getConfiguratorCapabilities() { return getNodes().filter(node => node.category === "capability"); }
export function isNodeSelected(configuration: RobotConfiguration, node: AssemblyNode) {
  const value = configuration[fields[node.category]];
  return Array.isArray(value) ? value.includes(node.id) : value === node.id;
}
export function updateAssembly(configuration: RobotConfiguration, node: AssemblyNode, remove = false): RobotConfiguration {
  const field = fields[node.category];
  if (field === "visionIds" || field === "capabilityIds") {
    return { ...configuration, [field]: remove ? configuration[field].filter(id => id !== node.id) : [...new Set([...configuration[field], node.id])] };
  }
  return { ...configuration, [field]: remove ? null : node.id };
}
