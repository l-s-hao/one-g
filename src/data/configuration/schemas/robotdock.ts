import { robotDockProduct } from "@/data/products/robotdock";
import type { ConfiguratorSchema } from "@/types/configuration";

// Reuse STEP 6 product facts. Interfaces and compatibility targets are not selections.
export const robotDockSchema: ConfiguratorSchema = {
  id: "robotdock", productId: robotDockProduct.id, productType: robotDockProduct.category,
  title: robotDockProduct.name, description: "四档标准套装，预览背包与末端设备组合。", entryHref: "/configure", cartLabel: "产品配置预览",
  purchaseMode: "preview", progressMode: "required",
  statusNote: "概念产品 · 配置仅用于预览。套装不包含机器人本体，型号与交付内容待确认。",
  defaults: { bundle: ["base"] },
  groups: [{
    id: "bundle", label: "套装", heading: "PACKAGE", slotLabel: "当前套装", installedLabel: "✓ 已选择套装",
    selectionMode: "single", required: true, minSelections: 1, maxSelections: 1,
    order: 0, slotLayout: "full", progressWeight: 1,
    options: (robotDockProduct.detail?.bundles ?? []).map(bundle => ({
      id: bundle.id, groupId: "bundle", name: bundle.name, description: bundle.description,
      status: robotDockProduct.status, metadata: { includes: [...bundle.items] },
    })),
  }],
};
