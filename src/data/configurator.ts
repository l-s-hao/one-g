import type { ConfigurationOption, ConfigurationStep, RobotConfiguration } from "@/types/configuration";

// MOCK DATA
// 配置名称、价格、兼容关系与步骤均未最终确定，后续替换为 API 数据。
// 基础机器人选项从 Product 数据映射，避免同型号存在两套价格。
export const configurationOptions: ConfigurationOption[] = [
  {
    "id": "standard-arm",
    "name": "标准机械臂",
    "category": "arm",
    "price": 30000,
    "status": "active",
    "legacyNames": [
      "标准机械臂"
    ]
  },
  {
    "id": "heavy-arm",
    "name": "高负载机械臂",
    "category": "arm",
    "price": 48000,
    "status": "active",
    "legacyNames": [
      "高负载机械臂"
    ]
  },
  {
    "id": "no-arm",
    "name": "不安装",
    "category": "arm",
    "price": 0,
    "status": "active",
    "legacyNames": [
      "不安装"
    ]
  },
  {
    "id": "five-finger",
    "name": "五指灵巧手",
    "category": "hand",
    "price": 28000,
    "status": "active",
    "legacyNames": [
      "五指灵巧手"
    ]
  },
  {
    "id": "gripper",
    "name": "工业夹爪",
    "category": "hand",
    "price": 8000,
    "status": "active",
    "legacyNames": [
      "工业夹爪"
    ]
  },
  {
    "id": "no-hand",
    "name": "不安装",
    "category": "hand",
    "price": 0,
    "status": "active",
    "legacyNames": [
      "不安装"
    ]
  },
  {
    "id": "rgbd",
    "name": "RGB-D",
    "category": "vision",
    "price": 6000,
    "status": "active",
    "legacyNames": [
      "RGB-D"
    ]
  },
  {
    "id": "stereo",
    "name": "双目视觉",
    "category": "vision",
    "price": 9000,
    "status": "active",
    "legacyNames": [
      "双目视觉"
    ]
  },
  {
    "id": "lidar",
    "name": "LiDAR",
    "category": "vision",
    "price": 12000,
    "status": "active",
    "legacyNames": [
      "LiDAR"
    ]
  },
  {
    "id": "transport",
    "name": "搬运",
    "category": "capability",
    "price": 10000,
    "status": "active",
    "legacyNames": [
      "搬运"
    ],
    "description": "在重复与高强度任务中保持稳定节奏。"
  },
  {
    "id": "inspection",
    "name": "巡检",
    "category": "capability",
    "price": 15000,
    "status": "active",
    "legacyNames": [
      "巡检"
    ],
    "description": "持续观察现场，及时发现异常变化。"
  },
  {
    "id": "teleoperation",
    "name": "遥操作",
    "category": "capability",
    "price": 20000,
    "status": "active",
    "legacyNames": [
      "遥操作"
    ],
    "description": "让专家经验远程抵达每一个现场。"
  },
  {
    "id": "ai",
    "name": "AI",
    "category": "capability",
    "price": 30000,
    "status": "active",
    "legacyNames": [
      "AI"
    ],
    "description": "用智能能力把感知转化为行动。"
  }
];
export const configurationSteps: ConfigurationStep[] = [
  {
    "category": "base",
    "name": "基础型号",
    "field": "baseRobotId",
    "multiple": false
  },
  {
    "category": "arm",
    "name": "机械臂",
    "field": "armId",
    "multiple": false
  },
  {
    "category": "hand",
    "name": "灵巧手",
    "field": "handId",
    "multiple": false
  },
  {
    "category": "vision",
    "name": "视觉系统",
    "field": "visionIds",
    "multiple": true
  },
  {
    "category": "capability",
    "name": "功能方案",
    "field": "capabilityIds",
    "multiple": true
  }
];
export const defaultConfiguration: RobotConfiguration = { baseRobotId: "g1", armId: "standard-arm", handId: "five-finger", visionIds: [], capabilityIds: [] };
