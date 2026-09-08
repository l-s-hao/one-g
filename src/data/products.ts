import type { Product, Category } from "@/types/product";

// MOCK DATA
// 产品型号、名称和价格尚未最终确定。
// 后续会替换为后端 API 数据。G1 图片当前也是占位素材。
export const products: Product[] = [
  // MOCK DATA
  // 当前核心产品仅用于官网原型展示，后续替换为正式产品数据。
  {
    "id": "g1",
    "slug": "g1",
    "name": "ONE-G G1",
    "category": "robot",
    "subtitle": "具身智能移动平台",
    "description": "面向真实场景的移动与执行基础平台。",
    "price": 39800,
    "images": [
      "/one-g/hero/one-g-service.png"
    ],
    "status": "active",
    "featured": true,
    "coreProduct": true,
    "showcase": {
      "titleLines": [
        "ONE-G",
        "G1"
      ],
      "descriptionLines": [
        "通用具身智能",
        "机器人平台"
      ],
      "eyebrow": "02 / CORE PRODUCT",
      "imageAlt": "现有完整服务机器人渲染图，待替换为 ONE-G G1 产品图"
    }
  },
  {
    "id": "g1-pro",
    "slug": "g1-pro",
    "name": "ONE-G G1 Pro",
    "category": "robot",
    "subtitle": "更强算力与负载能力",
    "description": "为复杂任务与连续作业打造的专业版本。",
    "price": 59800,
    "images": [],
    "status": "active",
    "featured": true
  },
  {
    "id": "arm-a1",
    "slug": "arm-a1",
    "name": "ONE-G Arm A1",
    "category": "arm",
    "subtitle": "灵活的六轴执行器",
    "description": "精准、稳定，适配装配与搬运任务。",
    "price": 12800,
    "images": ["/one-g/hero/one-g-arm.png"],
    "status": "active",
    "featured": false
  },
  {
    "id": "arm-a2",
    "slug": "arm-a2",
    "name": "ONE-G Arm A2",
    "category": "arm",
    "subtitle": "更远的工作半径",
    "description": "为更大空间和更高负载设计的机械臂。",
    "price": 18800,
    "images": [],
    "status": "active",
    "featured": false
  },
  {
    "id": "hand-d1",
    "slug": "hand-d1",
    "name": "ONE-G Hand D1",
    "category": "hand",
    "subtitle": "精细操作的末端能力",
    "description": "多自由度协同，处理更多复杂物体。",
    "price": 9800,
    "images": [],
    "status": "active",
    "featured": true
  },
  {
    "id": "vision-v1",
    "slug": "vision-v1",
    "name": "ONE-G Vision V1",
    "category": "vision",
    "subtitle": "让机器人看见世界",
    "description": "实时感知环境、目标与空间关系。",
    "price": 4800,
    "images": [],
    "status": "active",
    "featured": false
  },
  {
    "id": "rgbd",
    "slug": "rgbd",
    "name": "ONE-G RGB-D",
    "category": "vision",
    "subtitle": "深度与色彩融合感知",
    "description": "为导航、识别和定位提供可靠数据。",
    "price": 2980,
    "images": [],
    "status": "active",
    "featured": false
  },
  {
    "id": "lidar-kit",
    "slug": "lidar-kit",
    "name": "ONE-G LiDAR Kit",
    "category": "vision",
    "subtitle": "构建精确空间地图",
    "description": "高精度测距与环境建模套件。",
    "images": [],
    "status": "active",
    "featured": false
  }
];

export const categories: Category[] = [
  {
    "id": "robot",
    "name": "机器人"
  },
  {
    "id": "arm",
    "name": "机械臂"
  },
  {
    "id": "hand",
    "name": "灵巧手"
  },
  {
    "id": "vision",
    "name": "视觉系统"
  },
  {
    "id": "accessory",
    "name": "配件"
  }
];
