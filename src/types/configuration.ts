import type { CatalogStatus } from "./product";

export interface RobotConfiguration {
  baseRobotId: string | null;
  armId: string | null;
  handId: string | null;
  visionIds: string[];
  capabilityIds: string[];
}

export type ConfigurationCategory = "base" | "arm" | "hand" | "vision" | "capability";
export interface ConfigurationOption {
  id: string;
  name: string;
  category: ConfigurationCategory;
  price?: number;
  compatibleWith?: string[];
  status: CatalogStatus;
  legacyNames?: string[];
  description?: string;
}
export interface ConfigurationStep {
  category: ConfigurationCategory;
  name: string;
  field: keyof RobotConfiguration;
  multiple: boolean;
}
