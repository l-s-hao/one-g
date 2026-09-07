import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  output: "export",
  basePath: "/one-g",
  assetPrefix: "/one-g/",
  images: { unoptimized: true },
};

export default nextConfig;
