export const configuratorPrices = {
  基础型号: { "ONE-G G1": 180000, "ONE-G G1 Pro": 260000 },
  机械臂: { "标准机械臂": 30000, "高负载机械臂": 48000, "不安装": 0 },
  灵巧手: { "五指灵巧手": 28000, "工业夹爪": 8000, "不安装": 0 },
  视觉系统: { "RGB-D": 6000, "双目视觉": 9000, LiDAR: 12000 },
  功能: { 搬运: 10000, 巡检: 15000, 遥操作: 20000, AI: 30000 },
} as const;

export type ConfiguratorSelection = {
  基础型号: string;
  机械臂: string;
  灵巧手: string;
  视觉系统: string[];
  功能: string[];
};

export function getConfigurationTotal(selection: ConfiguratorSelection) {
  const base = configuratorPrices.基础型号[selection.基础型号 as keyof typeof configuratorPrices.基础型号] ?? 0;
  const arm = configuratorPrices.机械臂[selection.机械臂 as keyof typeof configuratorPrices.机械臂] ?? 0;
  const hand = configuratorPrices.灵巧手[selection.灵巧手 as keyof typeof configuratorPrices.灵巧手] ?? 0;
  const vision = selection.视觉系统.reduce((total, item) => total + (configuratorPrices.视觉系统[item as keyof typeof configuratorPrices.视觉系统] ?? 0), 0);
  const functions = selection.功能.reduce((total, item) => total + (configuratorPrices.功能[item as keyof typeof configuratorPrices.功能] ?? 0), 0);
  return base + arm + hand + vision + functions;
}

export function formatPrice(value: number) {
  return `¥ ${value.toLocaleString("zh-CN")}`;
}
