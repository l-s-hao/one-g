"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Bookmarked homepage product anchors remain valid after the content moves. */
export default function LegacyOfferingHash({ targets }: { targets: Record<string, string> }) {
  const router = useRouter();
  useEffect(() => {
    const redirect = () => {
      const target = targets[window.location.hash.slice(1)];
      if (target) router.replace(`${target}${window.location.search}`);
    };
    redirect();
    window.addEventListener("hashchange", redirect);
    window.addEventListener("popstate", redirect);
    return () => { window.removeEventListener("hashchange", redirect); window.removeEventListener("popstate", redirect); };
  }, [router, targets]);
  return null;
}
