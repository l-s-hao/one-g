import type { CatalogStatus } from "./product";

export interface RobotConfiguration {
  baseRobotId: string | null;
  armId: string | null;
  handId: string | null;
  visionIds: string[];
  capabilityIds: string[];
}

export type ConfigurationCategory = "base" | "arm" | "hand" | "vision" | "capability";
export interface RobotConfigurationOption extends ConfigurationOption {
  category: ConfigurationCategory;
  /** Legacy Robot allow-list: supported base IDs. Adapted into schema rules. */
  compatibleWith?: string[];
}

export interface ConfigurationOption {
  id: string;
  name: string;
  groupId: string;
  productId?: string;
  omitted?: boolean;
  metadata?: { includes?: string[]; [key: string]: unknown };
  price?: number;
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

export type ConfigurationState = Record<string, string[]>;
export interface ConfigurationGroup {
  id: string;
  label: string;
  heading: string;
  shortLabel?: string;
  slotLabel?: string;
  navigationLabel?: string;
  description?: string;
  installedLabel?: string;
  icon?: "box" | "hand" | "eye" | "cpu";
  selectionMode: "single" | "multiple";
  required: boolean;
  minSelections?: number;
  maxSelections?: number;
  order: number;
  slotLayout?: "full" | "half";
  rowWeight?: number;
  progressWeight?: number;
  options: ConfigurationOption[];
}
export interface OptionReference { groupId: string; optionId: string }
export type CompatibilityRule = { option: OptionReference } & (
  { type: "requires"; target: OptionReference } |
  { type: "incompatibleWith"; target: OptionReference } |
  { type: "requiresGroup"; groupId: string } |
  { type: "allowedOptions"; groupId: string; optionIds: string[] }
);
export interface ConfigurationScene { id: string; name: string; english: string; preferredGroup?: string }
export interface RecommendationRule { scene: string; recommended: Record<string, readonly string[] | undefined> }
export interface ConfiguratorSchema {
  productId?: string;
  purchaseMode?: "cart" | "preview";
  progressMode?: "installed" | "required";
  statusNote?: string;
  contactLabel?: string;
  /** Explicit query values initialize a fresh preview; absent values retain saved selections. */
  querySelections?: { parameter: string; groupId: string }[];
  id: string;
  productType: string;
  title: string;
  description?: string;
  entryHref: string;
  cartLabel: string;
  groups: ConfigurationGroup[];
  defaults: ConfigurationState;
  scenes?: ConfigurationScene[];
  scopes?: { id: string; groupId: string; english: string }[];
  recommendations?: readonly RecommendationRule[];
  compatibilityRules?: CompatibilityRule[];
}
export interface ConfigurationSnapshot {
  schemaId: string;
  /** Optional for compatibility with existing version-two records. */
  productId?: string;
  selections: ConfigurationState;
  name: string;
  category: string;
  price?: number;
  summary: { groupId: string; label: string; options: { id: string; name: string; price?: number }[] }[];
}
export interface StoredConfiguration {
  version: 2;
  schemaId: string;
  selections: ConfigurationState;
  snapshot?: ConfigurationSnapshot;
}
