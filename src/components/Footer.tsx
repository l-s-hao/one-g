"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <footer className="border-t border-white/10 bg-black px-6 py-8 text-center text-sm text-white/45">
      ONE - G / 万机智能
    </footer>
  );
}
