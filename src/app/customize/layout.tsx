import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "ONE-G 配置中心",
  description: "通过 ONE-G 标准模块与兼容规则，配置适合不同任务的机器人方案。",
};

export default function ConfigurationLayout({ children }: { children: ReactNode }) {
  return children;
}
