import type { ConfigurationCategory } from "@/types/configuration";

export interface SceneRecommendation {
  scene: string;
  // Single-slot categories use the first ID; multi-slot categories use every ID.
  recommended: Partial<Record<ConfigurationCategory, readonly string[]>>;
}

// MOCK RECOMMENDATION DATA
// 当前推荐方案仅用于验证 UI 和配置流程。
// 正式产品确定后由数据库 / 后端规则替换。
export const sceneRecommendations: readonly SceneRecommendation[] = [
  { scene: "handling", recommended: { base: ["g1"], arm: ["standard-arm"], hand: ["five-finger"], vision: ["rgbd"], capability: ["transport"] } },
  { scene: "inspection", recommended: { base: ["g1"], arm: ["standard-arm"], hand: ["gripper"], vision: ["rgbd", "lidar"], capability: ["inspection"] } },
  { scene: "teleoperation", recommended: { base: ["g1"], arm: ["standard-arm"], hand: ["five-finger"], vision: ["stereo"], capability: ["teleoperation"] } },
  { scene: "ai", recommended: { base: ["g1-pro"], arm: ["standard-arm"], hand: ["five-finger"], vision: ["rgbd", "stereo"], capability: ["ai"] } },
];
