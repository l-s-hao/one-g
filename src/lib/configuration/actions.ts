import type { ConfigurationState, ConfiguratorSchema } from "@/types/configuration";
import { configurationValid } from "./engine";
import { isConfigurationPreview, getConfigurationProduct } from "./policy";
import { getProductPolicy } from "@/lib/product-policy";

export function getConfigurationActions(schema: ConfiguratorSchema, state: ConfigurationState) {
  const preview = isConfigurationPreview(schema);
  const product = getConfigurationProduct(schema, state);
  const policy = getProductPolicy(product);
  const canSave = configurationValid(schema, state);
  return { preview, canSave, canAddToCart: canSave && !preview && policy.canAddToCart,
    canRequestQuote: policy.canRequestQuote,
    saveLabel: preview ? "保存配置预览" : "保存配置",
    configurationStatus: canSave ? "READY · 配置就绪" : "待完善配置" };
}
