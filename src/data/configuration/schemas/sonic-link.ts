import { sonicLinkProduct } from "@/data/products/sonic-link";
import type { ConfiguratorSchema } from "@/types/configuration";

// STEP 8 product facts are the single source for package contents and the optional add-on.
export const sonicLinkSchema: ConfiguratorSchema = {
  id: "sonic-link", productId: sonicLinkProduct.id, productType: sonicLinkProduct.category,
  title: sonicLinkProduct.name, description: "三档遥操套餐，可选配智元夹爪。", entryHref: "/configure", cartLabel: "遥操作配置预览",
  progressMode: "required", contactLabel: "获取报价",
  statusNote: sonicLinkProduct.detail?.statusNote,
  defaults: { bundle: ["three"], "add-on": [] },
  querySelections: [{ parameter: "bundle", groupId: "bundle" }],
  groups: [
    {
      id: "bundle", label: "遥操套餐", heading: "TELEOP PACKAGE", slotLabel: "当前遥操套餐", installedLabel: "✓ 已选择套餐",
      description: "必选一档；软件与采集硬件随套餐配套，不含机器人本体。双模式共用硬件。",
      selectionMode: "single", required: true, minSelections: 1, maxSelections: 1,
      order: 0, slotLayout: "full",
      options: (sonicLinkProduct.detail?.bundles ?? []).map(bundle => ({
        id: bundle.id, groupId: "bundle", name: bundle.name, description: bundle.description,
        status: sonicLinkProduct.status, metadata: { includes: [...bundle.items] },
      })),
    },
    {
      id: "add-on", label: "可选夹爪", heading: "OPTIONAL ADD-ON", slotLabel: "可选夹爪", installedLabel: "✓ 已选配",
      description: "可不选。不选时沿用 G1 自带橡胶手，不额外交付；夹爪型号、数量与支持功能待确认。",
      selectionMode: "multiple", required: false, minSelections: 0, maxSelections: 1,
      order: 1, slotLayout: "full", icon: "hand",
      options: (sonicLinkProduct.detail?.addOns ?? []).map(addOn => ({
        id: addOn.id, groupId: "add-on", name: addOn.name, description: addOn.description,
        status: sonicLinkProduct.status, metadata: { includes: [...addOn.items] },
      })),
    },
  ],
};
