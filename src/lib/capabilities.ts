import { capabilities, brandAdvantages } from "@/data/capabilities";

export function getCapabilities() { return capabilities.filter(scene => scene.status === "active").slice(0, 4); }
export function getBrandAdvantages() { return brandAdvantages.slice(0, 4); }
