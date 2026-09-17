import { configurationSteps } from "@/data/configurator";
import type { ConfigurationState, RobotConfiguration } from "@/types/configuration";

export function robotConfigurationToGeneric(robot: RobotConfiguration): ConfigurationState {
  return Object.fromEntries(configurationSteps.map(step => {
    const value = robot[step.field];
    return [step.category, Array.isArray(value) ? [...value] : value ? [value] : []];
  }));
}
export function genericToRobotConfiguration(state: ConfigurationState): RobotConfiguration {
  return { baseRobotId: state.base?.[0] ?? null, armId: state.arm?.[0] ?? null, handId: state.hand?.[0] ?? null,
    visionIds: [...(state.vision ?? [])], capabilityIds: [...(state.capability ?? [])] };
}
