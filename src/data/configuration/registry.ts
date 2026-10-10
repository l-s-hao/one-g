import { robotDockSchema } from "./schemas/robotdock";
import { robotSchema } from "./schemas/robot";
import type { ConfiguratorSchema } from "@/types/configuration";
export const configuratorRegistry: Readonly<Record<string, ConfiguratorSchema>> = { robot: robotSchema, robotdock: robotDockSchema };
export function getConfiguratorSchema(id: string): ConfiguratorSchema | undefined {
  return Object.hasOwn(configuratorRegistry, id) ? configuratorRegistry[id] : undefined;
}
