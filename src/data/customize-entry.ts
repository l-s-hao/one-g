import type { ConfigurationCategory } from "@/types/configuration";

export interface CustomizeChoice {
  id: string;
  name: string;
  english: string;
  description: string;
}

export interface CustomizeScene extends CustomizeChoice {
  preferredCategory: ConfigurationCategory;
}

export interface CustomizeScope extends CustomizeChoice {
  category: ConfigurationCategory;
}

// Mock entry catalog. Add scenes here; the UI is data-driven.
export const customizeScenes: readonly CustomizeScene[] = [
  { id: "handling", name: "搬运", english: "HANDLING", description: "让物料流转更轻松。", preferredCategory: "capability" },
  { id: "inspection", name: "巡检", english: "INSPECTION", description: "持续观察，发现现场变化。", preferredCategory: "vision" },
  { id: "teleoperation", name: "遥操作", english: "TELEOPERATION", description: "让操作跨越距离。", preferredCategory: "capability" },
  { id: "ai", name: "智能任务", english: "AI", description: "将感知转化为智能行动。", preferredCategory: "capability" },
];

export const customizeScopes: readonly CustomizeScope[] = [
  { id: "whole", name: "整机方案", english: "WHOLE ROBOT", description: "从基础平台开始，配置完整机器人。", category: "base" },
  { id: "arm", name: "机械臂", english: "ARM", description: "重点配置机械臂相关模块。", category: "arm" },
  { id: "end-effector", name: "末端执行器", english: "END EFFECTOR", description: "选择灵巧手、工业夹爪等。", category: "hand" },
  { id: "perception", name: "感知系统", english: "PERCEPTION", description: "选择 RGB-D、双目、LiDAR 等。", category: "vision" },
  { id: "capability", name: "功能能力", english: "CAPABILITY", description: "配置搬运、巡检、遥操作、AI 等。", category: "capability" },
];

// Unknown URL values are ignored, so direct and older links keep working.
export function getCustomizeEntry(sceneId: string | null, scopeId: string | null) {
  return {
    scene: customizeScenes.find(scene => scene.id === sceneId),
    scope: customizeScopes.find(scope => scope.id === scopeId),
  };
}

export function getCustomizeQuery(scene?: CustomizeScene, scope?: CustomizeScope) {
  const params = new URLSearchParams();
  if (scene) params.set("scene", scene.id);
  if (scope) params.set("scope", scope.id);
  return params.size ? `?${params.toString()}` : "";
}
