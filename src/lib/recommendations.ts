import { sceneRecommendations } from "@/data/recommendations";
import { getConfigurationSteps, getSelectedIds } from "./configurator";
import { getAvailability, getWorkbenchGroups } from "./workbench";
import type { RobotConfiguration } from "@/types/configuration";

export function getRecommendedGroups(sceneId?: string) {
  const recommendation = sceneRecommendations.find(item => item.scene === sceneId);
  if (!recommendation) return [];
  return getWorkbenchGroups().flatMap(group => {
    const ids = [...new Set(recommendation.recommended[group.category] ?? [])];
    const options = ids.flatMap(id => {
      const option = group.options.find(option => option.id === id && option.status === "active");
      return option ? [option] : [];
    });
    const selectedOptions = group.multiple ? options : options.slice(0, 1);
    return selectedOptions.length ? [{ ...group, options: selectedOptions }] : [];
  });
}

export type RecommendedGroup = ReturnType<typeof getRecommendedGroups>[number];

/** Replace only the recommended categories; keep any unspecified categories intact. */
export function buildRecommendedConfiguration(current: RobotConfiguration, groups: readonly RecommendedGroup[]): RobotConfiguration | null {
  const next = structuredClone(current);
  for (const group of groups) {
    const ids = group.options.map(option => option.id);
    if (group.field === "visionIds" || group.field === "capabilityIds") next[group.field] = ids;
    else next[group.field] = ids[0] ?? null;
  }
  // Validate against the completed candidate, including its recommended base platform.
  const valid = getWorkbenchGroups().every(group => {
    const selectedIds = getSelectedIds(next, group.field);
    return selectedIds.every(id => {
      const option = group.options.find(option => option.id === id);
      return option && getAvailability(option, next).available;
    });
  });
  return valid ? next : null;
}

export function configurationsEqual(left: RobotConfiguration, right: RobotConfiguration) {
  return getConfigurationSteps().every(group => {
    const a = [...getSelectedIds(left, group.field)].sort();
    const b = [...getSelectedIds(right, group.field)].sort();
    return a.length === b.length && a.every((id, index) => id === b[index]);
  });
}
