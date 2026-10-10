import type { Metadata } from "next";
import LegacySonicLinkRedirect from "@/components/LegacySonicLinkRedirect";
export const metadata: Metadata = { title: "ONE-G 系统配置", alternates: { canonical: "https://l-s-hao.github.io/one-g/solutions/teleoperation/" }, robots: { index: false, follow: true } };
export default function CompatibilityPage() { return <LegacySonicLinkRedirect />; }
