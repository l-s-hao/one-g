import type { Capability, BrandAdvantage } from "@/types/capability";

// MOCK DATA
// 实际应用场景以后根据正式产品能力调整。
// 图片暂用工程内相关产品渲染图，不代表实际应用现场或已验证的产品能力。
export const capabilities: Capability[] = [
  { id: "handling", name: "搬运", englishName: "MATERIAL HANDLING", description: "从抓取到转运，连接每一次行动。", image: "/one-g/hero/one-g-arm.png", imageAlt: "机械臂产品渲染图，用于搬运场景示意", status: "active" },
  { id: "inspection", name: "巡检", englishName: "INSPECTION", description: "观察环境，让变化被及时看见。", image: "/one-g/hero/one-g-mobile.png", imageAlt: "移动设备产品渲染图，用于巡检场景示意", status: "active" },
  { id: "teleoperation", name: "遥操作", englishName: "TELEOPERATION", description: "让人的判断，延伸至远方。", image: "/one-g/hero/one-g-arm.png", imageAlt: "机械臂产品渲染图，用于遥操作场景示意", status: "active" },
  { id: "intelligent-tasks", name: "智能任务", englishName: "INTELLIGENT TASKS", description: "连接感知与行动，探索更多任务。", image: "/one-g/hero/one-g-service.png", imageAlt: "完整服务机器人渲染图，用于智能任务场景示意", status: "active" },
];

// Phase 1 brand copy; final capability claims remain subject to product validation.
export const brandAdvantages: BrandAdvantage[] = [
  { id: "modular", name: "模块化", englishName: "MODULAR", description: "按任务组合硬件，让平台适应场景。" },
  { id: "control", name: "稳定控制", englishName: "CONTROL", description: "连接每个关节，协同每一次动作。" },
  { id: "intelligence", name: "智能感知", englishName: "INTELLIGENCE", description: "理解周围环境，为行动提供依据。" },
  { id: "scalable", name: "可扩展", englishName: "SCALABLE", description: "随需求增加模块，持续拓展能力。" },
];
