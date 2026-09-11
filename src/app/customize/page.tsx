"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getCustomizeEntry } from "@/data/customize-entry";
import CustomizeWorkbench from "@/components/CustomizeWorkbench";
import styles from "./workbench.module.css";

function CustomizeFromEntry() {
  const params = useSearchParams();
  const { scene, scope } = getCustomizeEntry(params.get("scene"), params.get("scope"));
  return <CustomizeWorkbench key={`${scene?.id ?? ""}/${scope?.id ?? ""}`} scene={scene} scope={scope} />;
}

export default function CustomizePage() {
  return <Suspense fallback={<div className={styles.page}><p role="status">正在加载配置工作台…</p></div>}><CustomizeFromEntry /></Suspense>;
}
