"use client";
import { usePathname } from "next/navigation";
import { localAppPathname } from "./route-paths";

/** Static HTML uses decoded route names; use the same name before rendering client shells. */
export function useAppPathname(): string {
  const pathname = usePathname();
  return (localAppPathname(pathname) ?? pathname).replace(/\/+$/, "") || "/";
}
