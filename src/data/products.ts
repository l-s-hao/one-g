export type ProductCategory = "机器人" | "机械臂" | "灵巧手" | "视觉系统" | "配件";
export type Product = { id: string; name: string; category: ProductCategory; subtitle: string; description: string; price: string; featured: boolean };
export const products: Product[] = [
  { id: "g1", name: "ONE-G G1", category: "机器人", subtitle: "具身智能移动平台", description: "面向真实场景的移动与执行基础平台。", price: "¥ 39,800 起", featured: true },
  { id: "g1-pro", name: "ONE-G G1 Pro", category: "机器人", subtitle: "更强算力与负载能力", description: "为复杂任务与连续作业打造的专业版本。", price: "¥ 59,800 起", featured: true },
  { id: "arm-a1", name: "ONE-G Arm A1", category: "机械臂", subtitle: "灵活的六轴执行器", description: "精准、稳定，适配装配与搬运任务。", price: "¥ 12,800 起", featured: false },
  { id: "arm-a2", name: "ONE-G Arm A2", category: "机械臂", subtitle: "更远的工作半径", description: "为更大空间和更高负载设计的机械臂。", price: "¥ 18,800 起", featured: false },
  { id: "hand-d1", name: "ONE-G Hand D1", category: "灵巧手", subtitle: "精细操作的末端能力", description: "多自由度协同，处理更多复杂物体。", price: "¥ 9,800 起", featured: true },
  { id: "vision-v1", name: "ONE-G Vision V1", category: "视觉系统", subtitle: "让机器人看见世界", description: "实时感知环境、目标与空间关系。", price: "¥ 4,800 起", featured: false },
  { id: "rgbd", name: "ONE-G RGB-D", category: "视觉系统", subtitle: "深度与色彩融合感知", description: "为导航、识别和定位提供可靠数据。", price: "¥ 2,980 起", featured: false },
  { id: "lidar-kit", name: "ONE-G LiDAR Kit", category: "视觉系统", subtitle: "构建精确空间地图", description: "高精度测距与环境建模套件。", price: "¥ 6,800 起", featured: false },
];
export const productCategories = ["全部", "机器人", "机械臂", "灵巧手", "视觉系统", "配件"] as const;
export function getProduct(id: string) { return products.find((product) => product.id === id); }
