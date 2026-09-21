import type { Metadata } from "next";
import LegacyConfigurationRedirect from "@/components/LegacyConfigurationRedirect";
export const metadata: Metadata = { title: "ONE-G 产品选购", robots: { index: false, follow: true } };
export default function ConfigurePage() { return <LegacyConfigurationRedirect/>; }
