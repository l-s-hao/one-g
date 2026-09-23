import type { ConfigurationSnapshot, ConfigurationState, ConfiguratorSchema, StoredConfiguration } from "@/types/configuration";
import { isConfigurationPreview, getConfigurationProduct } from "./policy";
import { parseConfiguration } from "@/lib/configurator";
import { robotConfigurationToGeneric } from "./adapters";
import { getConfigurationTotal, getWorkbenchGroups, normalizeState, configurationValid } from "./engine";

const storageKey = (schema: ConfiguratorSchema, userId?: string) => `one-g-config:${schema.id}${userId ? `:user:${userId}` : ""}`;
function readJSON(key: string): unknown {
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? null : JSON.parse(value) ?? undefined;
  } catch { return undefined; }
}
function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function selections(value: unknown): value is ConfigurationState {
  return record(value) && Object.values(value).every(ids => Array.isArray(ids) && ids.every(id => typeof id === "string"));
}
const snapshotPrice = (value: number | undefined) => value !== undefined && Number.isFinite(value) && value >= 0 ? value : undefined;
function optionalPrice(value: unknown) { return value === undefined || (typeof value === "number" && Number.isFinite(value) && value >= 0); }
function snapshot(value: unknown, schemaId: string): value is ConfigurationSnapshot {
  return record(value) && value.schemaId === schemaId && (value.productId === undefined || typeof value.productId === "string") && selections(value.selections) && typeof value.name === "string" && typeof value.category === "string" && optionalPrice(value.price) && Array.isArray(value.summary) && value.summary.every(group => record(group) && typeof group.groupId === "string" && typeof group.label === "string" && Array.isArray(group.options) && group.options.every(option => record(option) && typeof option.id === "string" && typeof option.name === "string" && optionalPrice(option.price)));
}
export function createSnapshot(schema: ConfiguratorSchema, state: ConfigurationState): ConfigurationSnapshot {
  const groups = getWorkbenchGroups(schema);
  const summary = groups.map(group => ({ groupId: group.id, label: group.label, options: (state[group.id] ?? []).flatMap(id => {
    const option = group.options.find(option => option.id === id);
    return option ? [{ id: option.id, name: option.name, price: snapshotPrice(option.price) }] : [];
  }) }));
  return { schemaId: schema.id, productId: getConfigurationProduct(schema, state)?.id, selections: structuredClone(state), name: `${summary[0]?.options[0]?.name ?? schema.title} 配置方案`, category: schema.cartLabel, price: snapshotPrice(getConfigurationTotal(schema, state)), summary };
}
export function saveConfiguration(schema: ConfiguratorSchema, state: ConfigurationState, userId?: string): StoredConfiguration {
  const selections = normalizeState(schema, state);
  const stored: StoredConfiguration = { version: 2, schemaId: schema.id, selections, ...(isConfigurationPreview(schema) || !configurationValid(schema, selections) ? {} : { snapshot: createSnapshot(schema, selections) }) };
  window.localStorage.setItem(storageKey(schema, userId), JSON.stringify(stored));
  return stored;
}
/** The original record remains intact. A failed migration write still returns the recovered selection. */
export async function readConfiguration(schema: ConfiguratorSchema, userId?: string): Promise<StoredConfiguration | null> {
  const raw = readJSON(storageKey(schema, userId));
  if (raw !== null) {
    if (!record(raw) || raw.version !== 2 || raw.schemaId !== schema.id || !selections(raw.selections) || (!isConfigurationPreview(schema) && !snapshot(raw.snapshot, schema.id))) return null;
    return { version: 2, schemaId: schema.id, selections: normalizeState(schema, raw.selections), ...(isConfigurationPreview(schema) ? {} : { snapshot: raw.snapshot as ConfigurationSnapshot }) };
  }
  if (userId || schema.id !== "robot") return null;
  const legacy = parseConfiguration(readJSON("one-g-config"));
  if (!legacy) return null;
  const state = robotConfigurationToGeneric(legacy);
  const stored: StoredConfiguration = { version: 2, schemaId: schema.id, selections: state, snapshot: createSnapshot(schema, state) };
  try { window.localStorage.setItem(storageKey(schema, userId), JSON.stringify(stored)); } catch { /* Read-only storage must not discard recovered data. */ }
  return stored;
}
export function removeConfiguration(schema: ConfiguratorSchema, userId?: string) {
  window.localStorage.removeItem(storageKey(schema, userId));
  if (!userId && schema.id === "robot") window.localStorage.removeItem("one-g-config");
}
