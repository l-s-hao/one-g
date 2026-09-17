import type { ConfigurationOption, ConfigurationState, ConfiguratorSchema, OptionReference } from "@/types/configuration";
import { getProductById } from "@/lib/products";
import { isConfigurationPreview } from "./policy";
import { formatPrice, sumPrices } from "@/lib/pricing";

export const optionKey = (option: ConfigurationOption) => JSON.stringify([option.groupId, option.id]);
export function getWorkbenchGroups(schema: ConfiguratorSchema) {
  return [...schema.groups].sort((a, b) => a.order - b.order).map(group => ({ ...group, options: group.options.map(option => {
    if (!option.productId) return option;
    const product = getProductById(option.productId);
    return { ...option, name: product?.name ?? option.name, price: product?.price, status: product?.status ?? "draft" as const };
  }).filter(option => option.status !== "draft") }));
}
export const emptyConfiguration = (schema: ConfiguratorSchema): ConfigurationState => Object.fromEntries(schema.groups.map(group => [group.id, []]));
export const getInitialConfiguration = (schema: ConfiguratorSchema) => normalizeState(schema, schema.defaults);
export function normalizeState(schema: ConfiguratorSchema, raw: unknown): ConfigurationState {
  const record = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  return Object.fromEntries(getWorkbenchGroups(schema).map(group => {
    const value = record[group.id];
    const ids = Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === "string" && group.options.some(option => option.id === id)))] : [];
    return [group.id, ids.slice(0, group.selectionMode === "single" ? 1 : group.maxSelections)];
  }));
}
export const isInstalled = (state: ConfigurationState, option: ConfigurationOption) => state[option.groupId]?.includes(option.id) ?? false;
const contains = (state: ConfigurationState, ref: OptionReference) => state[ref.groupId]?.includes(ref.optionId) ?? false;
export function getAvailability(schema: ConfiguratorSchema, option: ConfigurationOption, state: ConfigurationState) {
  if (option.status !== "active" && !(isConfigurationPreview(schema) && (option.status === "concept" || option.status === "coming-soon"))) return { available: false, label: "暂不可用" };
  const rules = schema.compatibilityRules?.filter(rule => rule.option.groupId === option.groupId && rule.option.optionId === option.id) ?? [];
  const valid = rules.every(rule => {
    if (rule.type === "requires") return contains(state, rule.target);
    if (rule.type === "incompatibleWith") return !contains(state, rule.target);
    if (rule.type === "requiresGroup") return (state[rule.groupId]?.length ?? 0) > 0;
    return state[rule.groupId]?.some(id => rule.optionIds.includes(id)) ?? false;
  });
  const group = schema.groups.find(group => group.id === option.groupId);
  const full = group?.selectionMode === "multiple" && group.maxSelections !== undefined && (state[option.groupId]?.length ?? 0) >= group.maxSelections && !isInstalled(state, option);
  return { available: valid && !full, label: full ? "已达到选择上限" : !valid ? "不满足兼容规则" : rules.length ? "可用" : "兼容关系待确认" };
}
export function changeModule(schema: ConfiguratorSchema, state: ConfigurationState, option: ConfigurationOption, remove = false): ConfigurationState {
  const group = schema.groups.find(group => group.id === option.groupId);
  if (!group || !group.options.some(item => item.id === option.id)) return state;
  const ids = state[group.id] ?? [];
  const next = { ...state, [group.id]: remove ? ids.filter(id => id !== option.id) : group.selectionMode === "single" ? [option.id] : [...new Set([...ids, option.id])] };
  if (!remove && !getAvailability(schema, option, state).available) return state;
  return next;
}
export function getConfigurationRows(schema: ConfiguratorSchema, state: ConfigurationState) {
  return getWorkbenchGroups(schema).map(group => {
    const options = (state[group.id] ?? []).map(id => group.options.find(option => option.id === id));
    return { groupId: group.id, label: group.label, value: options.map(option => option?.name ?? "选项已下架").join("、") || "未选择",
      price: group.required && !options.length ? undefined : sumPrices(options.map(option => option?.price)) };
  });
}
export const getConfigurationTotal = (schema: ConfiguratorSchema, state: ConfigurationState) => sumPrices(getConfigurationRows(schema, state).map(row => row.price));
export function configurationValid(schema: ConfiguratorSchema, state: ConfigurationState, requireComplete = true) {
  if (Object.keys(state).some(id => !schema.groups.some(group => group.id === id))) return false;
  return getWorkbenchGroups(schema).every(group => {
    const ids = state[group.id] ?? [];
    const minimum = group.minSelections ?? (group.required ? 1 : 0);
    const maximum = group.selectionMode === "single" ? 1 : group.maxSelections ?? Infinity;
    return (!requireComplete || ids.length >= minimum) && ids.length <= maximum && ids.every(id => {
      const option = group.options.find(option => option.id === id);
      return !!option && getAvailability(schema, option, state).available;
    });
  });
}
export function getProgress(schema: ConfiguratorSchema, state: ConfigurationState) {
  const dimensions = getWorkbenchGroups(schema).filter(group => schema.progressMode !== "required" || group.required || (group.minSelections ?? 0) > 0).map(group => ({ category: group.id, weight: group.progressWeight ?? 1,
    complete: (state[group.id] ?? []).filter(id => group.options.some(option => option.id === id && !option.omitted && getAvailability(schema, option, state).available)).length >= Math.max(1, group.minSelections ?? (group.required ? 1 : 0)) }));
  const weight = dimensions.reduce((sum, group) => sum + group.weight, 0);
  return { dimensions, completedCount: dimensions.filter(group => group.complete).length,
    completion: weight ? Math.round(100 * dimensions.reduce((sum, group) => sum + (group.complete ? group.weight : 0), 0) / weight) : 0 };
}
export function getRecommendedGroups(schema: ConfiguratorSchema, sceneId?: string) {
  const recommendation = schema.recommendations?.find(item => item.scene === sceneId);
  if (!recommendation) return [];
  return getWorkbenchGroups(schema).flatMap(group => {
    const ids = [...new Set(recommendation.recommended[group.id] ?? [])];
    const options = ids.flatMap(id => group.options.filter(option => option.id === id && option.status === "active")).slice(0, group.selectionMode === "single" ? 1 : group.maxSelections);
    return options.length ? [{ ...group, options }] : [];
  });
}
export type RecommendedGroup = ReturnType<typeof getRecommendedGroups>[number];
export function buildRecommendedConfiguration(schema: ConfiguratorSchema, state: ConfigurationState, groups: readonly RecommendedGroup[]) {
  const next = structuredClone(state);
  for (const group of groups) if (schema.groups.some(item => item.id === group.id)) next[group.id] = group.options.map(option => option.id);
  return configurationValid(schema, next, false) ? next : null;
}
export function configurationsEqual(left: ConfigurationState, right: ConfigurationState) {
  return [...new Set([...Object.keys(left), ...Object.keys(right)])].every(key => JSON.stringify([...(left[key] ?? [])].sort()) === JSON.stringify([...(right[key] ?? [])].sort()));
}
export function resolveDirection(schema: ConfiguratorSchema, sceneId: string | null, scopeId: string | null) {
  const scene = schema.scenes?.find(scene => scene.id === sceneId);
  const alias = schema.scopes?.find(scope => scope.id === scopeId);
  const id = scopeId ? alias?.groupId ?? scopeId : scene?.preferredGroup;
  const group = schema.groups.find(group => group.id === id) ?? getWorkbenchGroups(schema)[0];
  return { scene, scope: scopeId && group ? { id: scopeId, groupId: group.id, english: alias?.english ?? group.heading } : undefined };
}

/** Optional empty groups cost zero; unknown selected prices are never displayed as zero. */
export function getConfigurationPriceLabel(schema: ConfiguratorSchema, state: ConfigurationState) {
  const total = getConfigurationTotal(schema, state);
  if (total !== undefined && Number.isFinite(total)) return formatPrice(total);
  const prices = getWorkbenchGroups(schema).flatMap(group => (state[group.id] ?? []).map(id => group.options.find(option => option.id === id)?.price));
  return prices.some(price => price !== undefined && Number.isFinite(price)) ? "部分价格待确认" : "价格待定";
}

/** Query initialization is schema-declared, validated against options, and never writes storage. */
export function getEntrySelections(schema: ConfiguratorSchema, params: { get(name: string): string | null; has(name: string): boolean }): ConfigurationState | undefined {
  const bindings = schema.querySelections?.filter(binding => params.has(binding.parameter)) ?? [];
  if (!bindings.length) return undefined;
  const state = getInitialConfiguration(schema);
  for (const binding of bindings) {
    const group = getWorkbenchGroups(schema).find(group => group.id === binding.groupId);
    const option = group?.options.find(option => option.id === params.get(binding.parameter));
    if (option && getAvailability(schema, option, state).available) state[binding.groupId] = [option.id];
  }
  return configurationValid(schema, state) ? state : getInitialConfiguration(schema);
}
