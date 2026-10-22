"use client";

import { useSearchParams } from "next/navigation";
import VerificationLogin from "./VerificationLogin";

export default function LoginEntry() {
  const params = useSearchParams();
  return <VerificationLogin switching={params.get("mode") === "switch"} initialMode={params.get("method") === "admin" ? "admin" : "email"} initialRegion={params.get("region") === "international" ? "international" : "mainland"} returnTo={params.get("returnTo")} registered={params.get("registered") === "1"} />;
}
