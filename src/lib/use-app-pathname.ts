"use client";
import { usePathname } from "next/navigation";
import { localAppPathname } from "./route-paths";

/** 返回去除部署前缀、解码且无尾斜杠的页面路径；根路径固定为 /，页面壳与权限入口无需再处理。 */
export function useAppPathname(): string {
  const pathname = usePathname();
  return (localAppPathname(pathname) ?? pathname).replace(/\/+$/, "") || "/";
}
