import type { Metadata } from "next";
import LegacyConfigurationRedirect from "@/components/LegacyConfigurationRedirect";
export const metadata: Metadata = { title: "ONE-G 系统配置", alternates: { canonical: "https://l-s-hao.github.io/one-g/buy/robotdock/" }, robots: { index: false, follow: true } };
export default function CompatibilityPage() { return <LegacyConfigurationRedirect />; }
